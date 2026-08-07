import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import ExcelJS from 'exceljs';
import { format, subDays, subWeeks } from 'date-fns';
import { toast } from 'react-toastify';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import ReportsTable from './ReportsTable';
import ComplianceTable, { type ComplianceRow } from './ComplianceTable';
import SubmissionDetailsModal from './SubmissionDetailsModal';

interface ReportType {
  id: number;
  name: string;
  description?: string;
  fieldCount: number;
}

interface Column {
  name: string;
  label: string;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

interface SubmissionsResponse {
  submissions: Record<string, any>[];
  columns: Column[];
  pagination: PaginationInfo;
}

interface SubmissionDetails {
  id: number;
  data: Record<string, any>;
  labels: { name: string; label: string }[];
  submittedAt: string;
  submittedBy: string;
}

interface ComplianceResponse {
  weekStarts: string[];
  groups: ComplianceRow[];
}

type DateRange = 'all' | '7' | '30' | 'custom';

// Sentinel tab id for the static "Submission Compliance" tab, distinct from
// the numeric ids of dynamic report types fetched from the API.
const COMPLIANCE_TAB_ID = 'compliance' as const;
type ActiveTab = number | typeof COMPLIANCE_TAB_ID | null;

interface TabCache {
  data: Record<string, any>[];
  columns: Column[];
  dateRange: DateRange;
}

interface McaSummary {
  total: number;
  breakdown: { groupId: number; groupName: string; total: number }[];
  weekStart: string;
  weekEnd: string;
  reportFound: boolean;
}

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [reports, setReports] = useState<ReportType[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissions, setSubmissions] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tabCache, setTabCache] = useState<Record<number, TabCache>>({});
  const [complianceRows, setComplianceRows] = useState<ComplianceRow[]>([]);
  const [loadingCompliance, setLoadingCompliance] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails | null>(null);
  const [mcaSummary, setMcaSummary] = useState<McaSummary | null>(null);
  const [mcaLoading, setMcaLoading] = useState(true);

  useEffect(() => {
    get(
      `${remoteRoutes.reports}/mca/weekly-summary`,
      (response: McaSummary) => {
        setMcaSummary(response);
        setMcaLoading(false);
      },
      (error) => {
        console.error('Failed to fetch MCA summary:', error);
        setMcaLoading(false);
      },
    );
  }, []);

  // Fetch report types on mount
  useEffect(() => {
    get(
      remoteRoutes.reports,
      (response: any) => {
        const list: ReportType[] = Array.isArray(response) ? response : (response?.reports || []);
        setReports(list);
        // Fall back to the static Submission Compliance tab when there are
        // no dynamic report types, rather than leaving activeTab as null.
        setActiveTab(list.length > 0 ? list[0].id : COMPLIANCE_TAB_ID);
        setLoadingReports(false);
      },
      (error: any) => {
        console.error('Failed to fetch reports:', error);
        toast.error('Failed to load report types');
        setActiveTab(COMPLIANCE_TAB_ID);
        setLoadingReports(false);
      },
    );
  }, []);

  const getDateRange = useCallback((): { from: string; to: string } => {
    const to = format(new Date(), 'yyyy-MM-dd');
    let from: string;
    if (dateRange === '7') {
      from = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    } else if (dateRange === '30') {
      from = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    } else {
      from = '';
    }
    return { from, to };
  }, [dateRange]);

  // Compliance is inherently a per-reporting-week concept, so the same
  // dateRange control is reinterpreted here as "how many reporting weeks
  // back": 7 days -> current week only, 30 days -> last 4 weeks, all time
  // -> leave 'from' unset and let the backend apply its own lookback cap.
  const getComplianceDateRange = useCallback((): { from?: string; to: string } => {
    const to = format(new Date(), 'yyyy-MM-dd');
    if (dateRange === '7') {
      return { from: to, to };
    }
    if (dateRange === '30') {
      return { from: format(subWeeks(new Date(), 3), 'yyyy-MM-dd'), to };
    }
    return { to };
  }, [dateRange]);

  // Fetch submissions when active tab or date range changes
  useEffect(() => {
    if (activeTab === null || activeTab === COMPLIANCE_TAB_ID) return;

    // Check cache
    const cached = tabCache[activeTab];
    if (cached && cached.dateRange === dateRange) {
      setSubmissions(cached.data);
      setColumns(cached.columns);
      return;
    }

    setLoadingSubmissions(true);
    const { from, to } = getDateRange();
    const url = `${remoteRoutes.reports}/submissions/mygroups?reportId=${activeTab}&from=${from}&to=${to}&limit=20&offset=0`;

    get(
      url,
      (response: SubmissionsResponse) => {
        const data = response?.submissions || [];
        const cols = response?.columns || [];
        setSubmissions(data);
        setColumns(cols);
        setTabCache((prev) => ({
          ...prev,
          [activeTab]: { data, columns: cols, dateRange },
        }));
        setLoadingSubmissions(false);
      },
      (error: any) => {
        console.error('Failed to fetch submissions:', error);
        toast.error('Failed to load submissions');
        setSubmissions([]);
        setColumns([]);
        setLoadingSubmissions(false);
      },
    );
  }, [activeTab, dateRange, getDateRange, tabCache]);

  // Fetch compliance data when the compliance tab (or date range) is active
  useEffect(() => {
    if (activeTab !== COMPLIANCE_TAB_ID) return;
    let cancelled = false;

    setLoadingCompliance(true);
    const { from, to } = getComplianceDateRange();
    const fromParam = from ? `&from=${from}` : '';
    const url = `${remoteRoutes.reports}/mc/compliance?to=${to}${fromParam}`;

    get(
      url,
      (response: ComplianceResponse) => {
        if (cancelled) return;
        setComplianceRows(response?.groups || []);
        setLoadingCompliance(false);
      },
      (error: any) => {
        if (cancelled) return;
        console.error('Failed to fetch submission compliance:', error);
        toast.error('Failed to load submission compliance');
        setComplianceRows([]);
        setLoadingCompliance(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [activeTab, dateRange, getComplianceDateRange]);
  // Invalidate cache when date range changes
  useEffect(() => {
    setTabCache({});
  }, [dateRange]);

  const handleRowClick = (row: Record<string, any>) => {
    if (typeof activeTab !== 'number' || !row.id) return;
    setModalOpen(true);
    setDetailsLoading(true);
    setSubmissionDetails(null);

    get(
      `${remoteRoutes.reports}/${activeTab}/submissions/${row.id}`,
      (response: SubmissionDetails) => {
        setSubmissionDetails(response);
        setDetailsLoading(false);
      },
      (error: any) => {
        console.error('Failed to fetch submission details:', error);
        toast.error('Failed to load submission details');
        setDetailsLoading(false);
      },
    );
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: ActiveTab) => {
    setActiveTab(newValue);
  };

  const activeReportName = reports.find((r) => r.id === activeTab)?.name || 'Report';
  const isComplianceTab = activeTab === COMPLIANCE_TAB_ID;

  const handleDownload = async () => {
    if (isComplianceTab) {
      await downloadCompliance();
      return;
    }
    await downloadSubmissions();
  };

  const downloadSubmissions = async () => {
    if (submissions.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const exportData = submissions.map((row) => {
      const exportRow: Record<string, any> = {};

      columns.forEach((col) => {
        const value = row.data?.[col.name];
        exportRow[col.label] = value ?? '';
      });

      const submittedBy = typeof row.submittedBy === 'object' ? row.submittedBy?.name : row.submittedBy;
      exportRow['Submitted By'] = submittedBy || '';
      exportRow['Submitted At'] = row.submittedAt ? row.submittedAt.slice(0, 10) : '';

      return exportRow;
    });

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const fileName = `${activeReportName.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
    await exportToExcel(exportData, 'Submissions', fileName);
  };

  const downloadCompliance = async () => {
    if (complianceRows.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const exportData = complianceRows.map((row) => ({
      'MC Leader': row.leaderName,
      'MC Group': row.groupName,
      'Weeks Missed': `${row.weeksMissed} / ${row.weeksInRange}`,
      'Missed Weeks': row.missedWeeks.join(', '),
    }));

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const fileName = `MC_Submission_Compliance_${dateStr}.xlsx`;
    await exportToExcel(exportData, 'Compliance', fileName);
  };

  const exportToExcel = async (
    rows: Record<string, any>[],
    sheetName: string,
    fileName: string,
  ) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
    rows.forEach((row) => worksheet.addRow(row));

    let url: string | undefined;
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      toast.success('Report downloaded successfully');
    } catch {
      toast.error('Failed to generate report file');
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  };

  if (loadingReports) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Loading Reports...</Typography>
      </Container>
    );
  }

  const downloadDisabled = isComplianceTab
    ? loadingCompliance || complianceRows.length === 0
    : loadingSubmissions || submissions.length === 0;

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4">Reports</Typography>
          <Typography variant="body2" color="textSecondary">
            View and manage report submissions
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={downloadDisabled}
            sx={{ textTransform: 'none' }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* Tabs / Mobile Dropdown */}
      {isMobile ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select
            value={activeTab ?? ''}
            onChange={(e) => setActiveTab(e.target.value === COMPLIANCE_TAB_ID ? COMPLIANCE_TAB_ID : Number(e.target.value))}
          >
            {reports.map((report) => (
              <MenuItem key={report.id} value={report.id}>{report.name}</MenuItem>
            ))}
            <MenuItem value={COMPLIANCE_TAB_ID}>Submission Compliance</MenuItem>
          </Select>
        </FormControl>
      ) : (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {reports.map((report) => (
            <Tab key={report.id} label={report.name} value={report.id} />
          ))}
          <Tab label="Submission Compliance" value={COMPLIANCE_TAB_ID} />
        </Tabs>
      )}

      {/* MC Attendance for the Week */}
      {!mcaLoading && mcaSummary?.reportFound && (dateRange === '7') && (
        <Box sx={{ marginY: 2, backgroundColor: 'text.primary', padding: 2, borderRadius: 1, color: 'background.paper' }}>
          <Typography variant="h5">
            This Week's Total Fellowship Attendance: {mcaSummary.total}
          </Typography>
        </Box>
      )}

      {/* Table */}
      {isComplianceTab ? (
        <ComplianceTable
          rows={complianceRows}
          loading={loadingCompliance}
          showWeeksMissed={dateRange !== '7'}
        />
      ) : reports.length === 0 ? (
        <Typography color="textSecondary">No report types available</Typography>
      ) : (
        <ReportsTable
          columns={columns}
          data={submissions}
          loading={loadingSubmissions}
          onRowClick={handleRowClick}
        />
      )}

      {/* Details Modal */}
      <SubmissionDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        details={submissionDetails}
        loading={detailsLoading}
        reportName={activeReportName}
      />
    </Container>
  );
};

export default Reports;
