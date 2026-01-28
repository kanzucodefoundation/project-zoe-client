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
  AccessTimeRounded as AccessTimeRoundedIcon,
  StarRounded as StarRoundedIcon,
  EmojiEmotionsRounded as EmojiEmotionsRoundedIcon,
  ChildCareRounded as ChildCareRoundedIcon,
  LocationOnRounded as LocationOnRoundedIcon,
  HomeRounded as HomeRoundedIcon,
  PeopleRounded as PeopleRoundedIcon,
  BarChartRounded as BarChartRoundedIcon,
  GroupsRounded as GroupsRoundedIcon,
  PersonAddRounded as PersonAddRoundedIcon,
  FavoriteRounded as FavoriteRoundedIcon,
  WaterDropRounded as WaterDropRoundedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import type {$TsFixMe} from "../../utils/types.ts";
import BirthdayWidget from './BirthdayWidget';

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

interface LocationGroup {
  id: number;
  name: string;
  categoryName?: string;
  category?: { name: string };
}

const summaryCardsDef = [
  { key: 'avgAttendance', label: 'Avg Attendance', icon: GroupsRoundedIcon },
  { key: 'totalVisitors', label: 'Total Visitors', icon: PersonAddRoundedIcon },
  { key: 'salvations', label: 'Salvations', icon: FavoriteRoundedIcon },
  { key: 'baptisms', label: 'Baptisms', icon: WaterDropRoundedIcon },
] as const;

const metricCards = [
  { key: 'firstService', label: '1st Service', icon: AccessTimeRoundedIcon },
  { key: 'secondService', label: '2nd Service', icon: StarRoundedIcon },
  { key: 'yxp', label: 'YXP', icon: EmojiEmotionsRoundedIcon },
  { key: 'kids', label: 'Kids', icon: ChildCareRoundedIcon },
  { key: 'local', label: 'Local', icon: LocationOnRoundedIcon },
  { key: 'hostingCenter1', label: 'Hosting Center 1', icon: HomeRoundedIcon },
  { key: 'hostingCenter2', label: 'Hosting Center 2', icon: PeopleRoundedIcon },
  { key: 'overall', label: 'Overall', icon: BarChartRoundedIcon },
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
        setLocations(response || []);
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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
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
                onChange={(e) => setSelectedLocation(e.target.value as number | '')}
                disabled={loading}
                displayEmpty
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
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
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Report Buttons */}
      {reports.filter((r) => r.fieldCount && r.fieldCount > 0).length > 0 && (
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
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
                  backgroundColor: 'success.main',
                  '&:hover': { backgroundColor: 'success.dark' },
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
          <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            {card.label}
                          </Typography>
                          <Typography variant="h4" component="p" sx={{ fontWeight: 600 }}>
                            {summaryData[card.key]}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main',
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

          {/* Birthday Widget */}
          <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <BirthdayWidget />
            </Grid>
          </Grid>

          {/* Detailed Breakdown */}
          <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Service Breakdown
          </Typography>
          <Grid container spacing={2} columns={12} sx={{ mb: 4 }}>
            {metricCards.map((card) => {
              const IconComponent = card.icon;
              const isOverall = card.key === 'overall';
              return (
                <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      backgroundColor: isOverall 
                        ? (theme) => alpha(theme.palette.primary.main, 0.08)
                        : 'background.paper',
                      borderColor: isOverall ? 'primary.main' : 'divider',
                      borderWidth: isOverall ? 2 : 1,
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            {card.label}
                          </Typography>
                          <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>
                            {metrics[card.key]}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: isOverall 
                              ? 'primary.main' 
                              : (theme) => alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isOverall ? 'primary.contrastText' : 'primary.main',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 20 }} />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Recent Reports Table */}
          <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>DATE</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>1SV</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>2SV</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>YXP</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>KIDS</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>LOCAL</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>HC1</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>HC2</TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>ACTION</TableCell>
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
                          <TableCell sx={{ fontWeight: 600 }}>{row.total ?? '-'}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
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
