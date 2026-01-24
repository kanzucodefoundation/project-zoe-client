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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format, subDays } from 'date-fns';
import { toast } from 'react-toastify';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import ReportsTable from './ReportsTable';
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

interface SubmissionsResponse {
  reportId: number;
  data: Record<string, any>[];
  columns: Column[];
  footer?: Record<string, any>;
}

interface SubmissionDetails {
  id: number;
  data: Record<string, any>;
  labels: { name: string; label: string }[];
  submittedAt: string;
  submittedBy: string;
}

type DateRange = 'all' | '7' | '30' | 'custom';

interface TabCache {
  data: Record<string, any>[];
  columns: Column[];
  dateRange: DateRange;
}

const Reports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [reports, setReports] = useState<ReportType[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissions, setSubmissions] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tabCache, setTabCache] = useState<Record<number, TabCache>>({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails | null>(null);

  // Fetch report types on mount
  useEffect(() => {
    get(
      remoteRoutes.reports,
      (response: any) => {
        const list: ReportType[] = Array.isArray(response) ? response : (response?.reports || []);
        setReports(list);
        if (list.length > 0) {
          setActiveTab(list[0].id);
        }
        setLoadingReports(false);
      },
      (error: any) => {
        console.error('Failed to fetch reports:', error);
        toast.error('Failed to load report types');
        setLoadingReports(false);
      },
    );
  }, []);

  const getDateParams = useCallback((): string => {
    if (dateRange === 'all') return '';
    const to = format(new Date(), 'yyyy-MM-dd');
    let from: string;
    if (dateRange === '7') {
      from = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    } else if (dateRange === '30') {
      from = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    } else {
      return '';
    }
    return `?from=${from}&to=${to}`;
  }, [dateRange]);

  // Fetch submissions when active tab or date range changes
  useEffect(() => {
    if (activeTab === null) return;

    // Check cache
    const cached = tabCache[activeTab];
    if (cached && cached.dateRange === dateRange) {
      setSubmissions(cached.data);
      setColumns(cached.columns);
      return;
    }

    setLoadingSubmissions(true);
    const params = getDateParams();

    get(
      `${remoteRoutes.reports}/${activeTab}/submissions${params}`,
      (response: SubmissionsResponse) => {
        const data = response?.data || [];
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
  }, [activeTab, dateRange, getDateParams]);

  // Invalidate cache when date range changes
  useEffect(() => {
    setTabCache({});
  }, [dateRange]);

  const handleRowClick = (row: Record<string, any>) => {
    if (!activeTab || !row.id) return;
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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const activeReportName = reports.find((r) => r.id === activeTab)?.name || 'Report';

  if (loadingReports) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Loading Reports...</Typography>
      </Container>
    );
  }

  if (reports.length === 0) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Reports</Typography>
        <Typography color="textSecondary">No report types available</Typography>
      </Container>
    );
  }

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
      </Box>

      {/* Tabs / Mobile Dropdown */}
      {isMobile ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select
            value={activeTab ?? ''}
            onChange={(e) => setActiveTab(Number(e.target.value))}
          >
            {reports.map((report) => (
              <MenuItem key={report.id} value={report.id}>{report.name}</MenuItem>
            ))}
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
        </Tabs>
      )}

      {/* Table */}
      <ReportsTable
        columns={columns}
        data={submissions}
        loading={loadingSubmissions}
        onRowClick={handleRowClick}
      />

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
