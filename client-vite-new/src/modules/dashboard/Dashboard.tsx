import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Container,
  Button,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import {
  Send,
  MoreVert as MoreVertIcon,
  AccessTime,
  Star,
  EmojiEmotions,
  ChildCare,
  LocationOn,
  Home,
  People,
  BarChart,
  Groups,
  PersonAdd,
  Favorite,
  WaterDrop,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { toast } from 'react-toastify';
import type {$TsFixMe} from "../../utils/types.ts";

interface SummaryMetrics {
  avgAttendance: number;
  totalVisitors: number;
  salvations: number;
  baptisms: number;
}

interface DashboardMetrics {
  firstService: number;
  secondService: number;
  yxp: number;
  kids: number;
  local: number;
  hostingCenter1: number;
  hostingCenter2: number;
  overall: number;
  summary: SummaryMetrics;
}

interface RecentSubmission {
  id: number;
  date: string;
  firstService: number;
  secondService: number;
  yxp: number;
  kids: number;
  local: number;
  hostingCenter1: number;
  hostingCenter2: number;
  total: number;
}

interface DashboardData {
  metrics: DashboardMetrics;
  timeRange: { label: string };
  recentSubmissions: RecentSubmission[];
}

interface IReport {
  id: number;
  name: string;
  fieldCount?: number;
}

type TimeRange = 'week' | 'month' | '3months';

const timeRangeOptions = [
  { value: 'week', label: 'Past 7 Days' },
  { value: 'month', label: 'Past Month' },
  { value: '3months', label: 'Past 3 Months' },
];

const summaryCardsDef = [
  { key: 'avgAttendance', label: 'Avg Attendance', icon: <Groups sx={{ fontSize: 32 }} /> },
  { key: 'totalVisitors', label: 'Total Visitors', icon: <PersonAdd sx={{ fontSize: 32 }} /> },
  { key: 'salvations', label: 'Salvations', icon: <Favorite sx={{ fontSize: 32 }} /> },
  { key: 'baptisms', label: 'Baptisms', icon: <WaterDrop sx={{ fontSize: 32 }} /> },
] as const;

const metricCards = [
  { key: 'firstService', label: '1st Service', icon: <AccessTime /> },
  { key: 'secondService', label: '2nd Service', icon: <Star /> },
  { key: 'yxp', label: 'YXP', icon: <EmojiEmotions /> },
  { key: 'kids', label: 'Kids', icon: <ChildCare /> },
  { key: 'local', label: 'Local', icon: <LocationOn /> },
  { key: 'hostingCenter1', label: 'Hosting Center 1', icon: <Home /> },
  { key: 'hostingCenter2', label: 'Hosting Center 2', icon: <People /> },
  { key: 'overall', label: 'Overall', icon: <BarChart /> },
] as const;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reports, setReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Actions menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<RecentSubmission | null>(null);

  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);

  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.dashboardSummary}?timeRange=${timeRange}`,
      (response: $TsFixMe) => {
        setDashboardData(response);
        setLoading(false);
      },
      (error: $TsFixMe) => {
        console.error('Dashboard API Error:', error);
        setLoading(false);
      },
    );
  }, [timeRange]);

  useEffect(() => {
    get(
      remoteRoutes.reports,
      (response: $TsFixMe) => {
        setReports(response.reports || []);
      },
      (error: $TsFixMe) => {
        console.error('Failed to fetch reports:', error);
      },
    );
  }, []);

  const metrics: DashboardMetrics = dashboardData?.metrics || {
    firstService: 0,
    secondService: 0,
    yxp: 0,
    kids: 0,
    local: 0,
    hostingCenter1: 0,
    hostingCenter2: 0,
    overall: 0,
    summary: { avgAttendance: 0, totalVisitors: 0, salvations: 0, baptisms: 0 },
  };

  const summaryData: SummaryMetrics = dashboardData?.metrics?.summary || {
    avgAttendance: 0,
    totalVisitors: 0,
    salvations: 0,
    baptisms: 0,
  };

  const timeRangeLabel = dashboardData?.timeRange?.label
    || timeRangeOptions.find((o) => o.value === timeRange)?.label
    || 'Past Month';

  const recentSubmissions = dashboardData?.recentSubmissions || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: RecentSubmission) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleViewDetails = () => {
    if (selectedRow) {
      toast.info('Submission details view coming soon');
    }
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return dateString.slice(0, 10);
  };

  return (
    <Container maxWidth="xl" sx={{ backgroundColor: 'red'}}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Welcome, {user?.fullName || user?.username || 'User'}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's an overview of your metrics.
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              disabled={loading}
            >
              {timeRangeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Report Buttons */}
      {reports.filter((r) => r.fieldCount && r.fieldCount > 0).length > 0 && (
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5} mb={3}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 0.5 }}>
            Submit Report:
          </Typography>
          {reports
            .filter((r) => r.fieldCount && r.fieldCount > 0)
            .map((report) => (
              <Button
                key={report.id}
                variant="contained"
                size="small"
                startIcon={<Send />}
                onClick={() => navigate(`/reports/${report.id}/submit`)}
                sx={{
                  backgroundColor: '#1b813e',
                  '&:hover': { backgroundColor: '#15662f' },
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                {report.name}
              </Button>
            ))}
        </Box>
      )}

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Section */}
          <Typography
            sx={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a2332', mb: 2 }}
          >
            Sunday Service Metrics ({timeRangeLabel})
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
            gap={2.5}
            sx={{ mb: 4 }}
          >
            {summaryCardsDef.map((card) => (
              <Paper
                key={card.key}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  minHeight: 120,
                  backgroundColor: '#fff',
                  borderColor: 'grey.200',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}>
                      {card.label}
                    </Typography>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                      {summaryData[card.key]}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#e3f2fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* Detailed Breakdown */}
          <Typography
            sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a2332', mb: 2 }}
          >
            Service Breakdown
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
            gap={2}
            sx={{ mb: 4 }}
          >
            {metricCards.map((card) => {
              const isOverall = card.key === 'overall';
              return (
                <Paper
                  key={card.key}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    minHeight: 100,
                    backgroundColor: isOverall ? '#f0f7ff' : '#fff',
                    borderColor: isOverall ? 'primary.main' : 'grey.200',
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>
                        {card.label}
                      </Typography>
                      <Typography sx={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                        {metrics[card.key]}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: isOverall ? 'primary.main' : '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isOverall ? '#fff' : 'primary.main',
                        '& .MuiSvgIcon-root': { fontSize: 20 },
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          {/* Recent Reports Table */}
          <Typography
            sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a2332', mb: 2 }}
          >
            Recent PGA Reports
          </Typography>

          {recentSubmissions.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography color="text.secondary">
                No submissions found for this time period
              </Typography>
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
              <TableContainer sx={{ overflowX: 'auto', width:'100%' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>DATE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>1SV</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>2SV</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>YXP</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>KIDS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>LOCAL</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>HC1</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>HC2</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSubmissions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(row.date)}</TableCell>
                          <TableCell>{row.firstService ?? '-'}</TableCell>
                          <TableCell>{row.secondService ?? '-'}</TableCell>
                          <TableCell>{row.yxp ?? '-'}</TableCell>
                          <TableCell>{row.kids ?? '-'}</TableCell>
                          <TableCell>{row.local ?? '-'}</TableCell>
                          <TableCell>{row.hostingCenter1 ?? '-'}</TableCell>
                          <TableCell>{row.hostingCenter2 ?? '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{row.total ?? '-'}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={recentSubmissions.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10]}
              />
            </Paper>
          )}
        </>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
      </Menu>
    </Container>
  );
};

export default Dashboard;
