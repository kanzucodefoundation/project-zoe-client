import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
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
  Card,
  CardContent,
  IconButton,
  Menu,
  CircularProgress,
  TablePagination,
  Grid,
  Stack,
  alpha,
} from '@mui/material';
import {
  SendRounded as SendRoundedIcon,
  MoreVertRounded as MoreVertRoundedIcon,
  PeopleRounded as PeopleRoundedIcon,
  GroupsRounded as GroupsRoundedIcon,
  TrendingUpRounded as TrendingUpRoundedIcon,
  LocationOnRounded as LocationOnRoundedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import type { $TsFixMe } from '../../utils/types.ts';
import BirthdayWidget from './BirthdayWidget';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

interface SummaryMetrics {
  avgAttendance: number;
  peakAttendance: number;
  totalAttendance: number;
  locationsReporting: number;
}

interface DashboardMetrics {
  summary: SummaryMetrics;
}

interface RecentSubmission {
  id: number;
  date: string;
  location: string;
  pga: number;
}

interface PgaTrendPoint {
  period: string | null;
  total: number;
}

interface LocationPgaRanking {
  groupId: number;
  name: string;
  pga: number;
}

interface DashboardData {
  metrics: DashboardMetrics;
  timeRange: { label: string };
  recentSubmissions: RecentSubmission[];
  pgaTrend: PgaTrendPoint[];
  locationRanking: LocationPgaRanking[];
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

interface LocationGroup {
  id: number;
  name: string;
  categoryName?: string;
  category?: { name: string; purpose?: string };
}

const summaryCardsDef = [
  {
    key: 'avgAttendance',
    label: 'Avg Attendance',
    icon: GroupsRoundedIcon,
    format: true,
  },
  {
    key: 'peakAttendance',
    label: 'Peak Attendance',
    icon: TrendingUpRoundedIcon,
    format: true,
  },
  {
    key: 'totalAttendance',
    label: 'Total Attendance',
    icon: PeopleRoundedIcon,
    format: true,
  },
  {
    key: 'locationsReporting',
    label: 'Locations Reporting',
    icon: LocationOnRoundedIcon,
    format: false,
  },
] as const;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [reports, setReports] = useState<IReport[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [locations, setLocations] = useState<LocationGroup[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');

  // Actions menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<RecentSubmission | null>(null);

  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);

  // Fetch user's accessible locations (groups with children from backend)
  useEffect(() => {
    get(
      remoteRoutes.groupsMyGroups,
      (response: LocationGroup[]) => {
        setLocations(
          (response || []).filter((g) => g.category?.purpose === 'location'),
        );
      },
      (error: $TsFixMe) => {
        console.error('Failed to fetch user locations:', error);
      },
    );
  }, []);

  // React Query for dashboard data
  const { data: dashboardData, isLoading: loading } = useQuery<DashboardData>({
    queryKey: ['dashboardSummary', timeRange, selectedLocation],
    queryFn: () => {
      return new Promise<DashboardData>((resolve, reject) => {
        let url = `${remoteRoutes.dashboardSummary}?timeRange=${timeRange}`;
        if (selectedLocation) {
          url += `&groupId=${selectedLocation}`;
        }
        get(
          url,
          (response: $TsFixMe) => {
            resolve(response);
          },
          (error: $TsFixMe) => {
            console.error('Dashboard API Error:', error);
            reject(error);
          },
        );
      });
    },
  });

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

  const summaryData: SummaryMetrics = dashboardData?.metrics?.summary || {
    avgAttendance: 0,
    peakAttendance: 0,
    totalAttendance: 0,
    locationsReporting: 0,
  };

  const timeRangeLabel =
    dashboardData?.timeRange?.label ||
    timeRangeOptions.find((o) => o.value === timeRange)?.label ||
    'Past Month';

  const recentSubmissions = dashboardData?.recentSubmissions || [];
  const pgaTrend = (dashboardData?.pgaTrend || []).filter(
    (point): point is PgaTrendPoint & { period: string } =>
      typeof point.period === 'string' && point.period.length > 0,
  );
  const locationRanking = dashboardData?.locationRanking || [];

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    row: RecentSubmission,
  ) => {
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

  const formatPeriodLabel = (period: string) => {
    const [year, month, day] = period.split('-').map(Number);
    if (!year || !month || !day) {
      return period;
    }

    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            Welcome, {user?.fullName || user?.username || 'User'}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's an overview of your metrics.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          {locations.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={selectedLocation}
                onChange={(e) =>
                  setSelectedLocation(e.target.value as number | '')
                }
                disabled={loading}
                displayEmpty
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              disabled={loading}
            >
              {timeRangeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Report Buttons */}
      {reports.filter((r) => r.fieldCount && r.fieldCount > 0).length > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={1.5}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Submit Report:
          </Typography>
          {reports
            .filter((r) => r.fieldCount && r.fieldCount > 0)
            .map((report) => (
              <Button
                key={report.id}
                variant="contained"
                size="small"
                startIcon={<SendRoundedIcon />}
                onClick={() => navigate(`/reports/${report.id}/submit`)}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {report.name}
              </Button>
            ))}
        </Stack>
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
            component="h2"
            variant="h6"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Sunday Service Metrics ({timeRangeLabel})
          </Typography>
          <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>
            {summaryCardsDef.map((card) => {
              const IconComponent = card.icon;
              return (
                <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {card.label}
                          </Typography>
                          <Typography
                            variant="h4"
                            component="p"
                            sx={{ fontWeight: 600 }}
                          >
                            {card.format
                              ? summaryData[card.key].toLocaleString()
                              : summaryData[card.key]}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.paper',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 28 }} />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* PGA Trend & Location Ranking */}
          <Typography
            component="h2"
            variant="h6"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            PGA Trends
          </Typography>
          <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Weekly PGA Trend
                  </Typography>
                  {pgaTrend.length > 0 ? (
                    <LineChart
                      height={280}
                      series={[
                        {
                          data: pgaTrend.map((p) => p.total),
                          label: 'PGA',
                          curve: 'linear',
                        },
                      ]}
                      xAxis={[
                        {
                          scaleType: 'point',
                          data: pgaTrend.map((p) =>
                            formatPeriodLabel(p.period),
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height={280}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No trend data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Top Locations by PGA (latest week)
                  </Typography>
                  {locationRanking.length > 0 ? (
                    <BarChart
                      height={Math.max(220, locationRanking.length * 36)}
                      layout="horizontal"
                      series={[
                        {
                          data: locationRanking.map((l) => l.pga),
                          label: 'PGA',
                        },
                      ]}
                      yAxis={[
                        {
                          scaleType: 'band',
                          data: locationRanking.map((l) => l.name),
                        },
                      ]}
                      margin={{ left: 110 }}
                    />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height={220}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No ranking data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Birthday Widget */}
          <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <BirthdayWidget />
            </Grid>
          </Grid>

          {/* Recent Reports Table */}
          <Typography
            component="h2"
            variant="h6"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Recent PGA Reports
          </Typography>

          {recentSubmissions.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="body2" color="text.secondary">
                No submissions found for this time period
              </Typography>
            </Box>
          ) : (
            <Card variant="outlined">
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        DATE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        LOCATION
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        PGA
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ACTION
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSubmissions
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDate(row.date)}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {row.location}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {row.pga ?? '-'}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, row)}
                            >
                              <MoreVertRoundedIcon fontSize="small" />
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
            </Card>
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
    </Box>
  );
};

export default Dashboard;
