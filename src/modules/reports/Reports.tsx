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
import { format, subDays, subWeeks, startOfWeek } from 'date-fns';
import { toast } from 'react-toastify';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import ReportsTable from './ReportsTable';
import ComplianceTable, { type ComplianceRow } from './ComplianceTable';
import SubmissionDetailsModal from './SubmissionDetailsModal';
import type {Column, SubmissionRow } from '../../utils/types';

interface ReportType {
  id: number;
  name: string;
  description?: string;
  fieldCount: number;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

interface SubmissionsResponse {
  submissions: SubmissionRow[];
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

// Sentinel tab id for the static "MC Report Submission Compliance" tab, distinct from
// the numeric ids of dynamic report types fetched from the API.
const COMPLIANCE_TAB_ID = 'compliance' as const;
type ActiveTab = number | typeof COMPLIANCE_TAB_ID | null;

interface TabCache {
  data: SubmissionRow[];
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

// Small helper so we don't spread `any` around every catch handler.
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [reports, setReports] = useState<ReportType[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
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
      (error: unknown) => {
        console.error('Failed to fetch MCA summary:', getErrorMessage(error));
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
        // Fall back to the static MC Report Submission Compliance tab when there are
        // no dynamic report types, rather than leaving activeTab as null.
        setActiveTab(list.length > 0 ? list[0].id : COMPLIANCE_TAB_ID);
        setLoadingReports(false);
      },
      (error: unknown) => {
        console.error('Failed to fetch reports:', getErrorMessage(error));
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

  // Reporting periods are Sunday-start weeks, matching the backend's
  // getStartOfWeek()/reportingPeriod convention.
  const getComplianceDateRange = useCallback((): { from?: string; to: string } => {
    const now = new Date();
    const to = format(now, 'yyyy-MM-dd');
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });

    if (dateRange === '7') {
      // Current reporting week only.
      return { from: format(currentWeekStart, 'yyyy-MM-dd'), to };
    }
    if (dateRange === '30') {
      // Last 4 completed reporting weeks, excluding the current (partial) week.
      const lastCompletedWeekEnd = subDays(currentWeekStart, 1);
      const from = subWeeks(currentWeekStart, 4);
      return {
        from: format(from, 'yyyy-MM-dd'),
        to: format(lastCompletedWeekEnd, 'yyyy-MM-dd'),
      };
    }
    // All time: omit `from` entirely so the backend applies its own
    // configured lookback cap, rather than forcing a hardcoded epoch here.
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
      (error: unknown) => {
        console.error('Failed to fetch submissions:', getErrorMessage(error));
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
      (error: unknown) => {
        if (cancelled) return;
        console.error('Failed to fetch MC Report Submission Compliance:', getErrorMessage(error));
        toast.error('Failed to load MC Report Submission Compliance');
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

  const handleRowClick = (row: SubmissionRow) => {
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
      (error: unknown) => {
        console.error('Failed to fetch submission details:', getErrorMessage(error));
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
      const exportRow: Record<string, string | number> = {};

      columns.forEach((col) => {
        const value = row.data?.[col.name];
        exportRow[col.label] = (value as string | number) ?? '';
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
    const fileName = `MC_Report_Submission_Compliance_${dateStr}.xlsx`;
    await exportToExcel(exportData, 'Compliance', fileName);
  };

  const exportToExcel = async <T extends Record<string, string | number>>(
    rows: T[],
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
            <MenuItem value={COMPLIANCE_TAB_ID}>MC Report Submission Compliance</MenuItem>
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
          <Tab label="MC Report Submission Compliance" value={COMPLIANCE_TAB_ID} />
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
