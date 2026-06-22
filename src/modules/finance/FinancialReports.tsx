import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import {
  PieChart,
  BarChart,
} from '@mui/x-charts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type { ReconciliationSummary, DistributionSummary, FinancialAccount } from './types';

const FinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);

  // Filters
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    dayjs().startOf('month')
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs());
  const [accountFilter, setAccountFilter] = useState<number | 'ALL'>('ALL');

  // Report data
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummary | null>(null);
  const [distributionSummary, setDistributionSummary] = useState<DistributionSummary | null>(null);

  const fetchReports = () => {
    if (!dateFrom || !dateTo) return;

    setLoading(true);

    const params = new URLSearchParams({
      dateFrom: dateFrom.format('YYYY-MM-DD'),
      dateTo: dateTo.format('YYYY-MM-DD'),
    });
    if (accountFilter !== 'ALL') {
      params.append('accountId', accountFilter.toString());
    }

    // Fetch reconciliation summary
    get(
      `${remoteRoutes.financialReconciliation}/summary?${params.toString()}`,
      (data: ReconciliationSummary) => {
        setReconciliationSummary(data);
      },
      () => {
        setReconciliationSummary(null);
      }
    );

    // Fetch distribution summary
    get(
      `${remoteRoutes.financialDistributions}/summary?${params.toString()}`,
      (data: DistributionSummary) => {
        setDistributionSummary(data);
        setLoading(false);
      },
      () => {
        setDistributionSummary(null);
        setLoading(false);
      }
    );
  };

  const fetchAccounts = () => {
    get(
      remoteRoutes.financialAccounts,
      (data: FinancialAccount[]) => {
        setAccounts(data.filter((a) => a.isActive));
      },
      () => {}
    );
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [dateFrom, dateTo, accountFilter]);

  const handleExport = () => {
    if (!dateFrom || !dateTo) return;

    const params = new URLSearchParams({
      dateFrom: dateFrom.format('YYYY-MM-DD'),
      dateTo: dateTo.format('YYYY-MM-DD'),
      format: 'csv',
    });
    if (accountFilter !== 'ALL') {
      params.append('accountId', accountFilter.toString());
    }

    window.open(
      `${remoteRoutes.financialReconciliation}/export?${params.toString()}`,
      '_blank'
    );
    toast.success('Export started');
  };

  // Prepare chart data
  const categoryData = reconciliationSummary?.byCategory
    ? Object.entries(reconciliationSummary.byCategory).map(([category, amount]) => ({
        label: category,
        value: amount,
      }))
    : [];

  const locationData = distributionSummary?.byLocation
    ? Object.entries(distributionSummary.byLocation).map(([location, amount]) => ({
        location,
        amount,
      }))
    : [];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Financial Reports</Typography>
          <Box display="flex" gap={1}>
            <Button startIcon={<RefreshIcon />} onClick={fetchReports}>
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <DatePicker
              label="From"
              value={dateFrom}
              onChange={(value) => setDateFrom(value as Dayjs | null)}
              slotProps={{
                textField: { size: 'small', sx: { width: 180 } },
              }}
            />
            <DatePicker
              label="To"
              value={dateTo}
              onChange={(value) => setDateTo(value as Dayjs | null)}
              slotProps={{
                textField: { size: 'small', sx: { width: 180 } },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Account</InputLabel>
              <Select
                value={accountFilter}
                label="Account"
                onChange={(e) =>
                  setAccountFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                }
              >
                <MenuItem value="ALL">All Accounts</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} mb={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Total Imported
                    </Typography>
                    <Typography variant="h4">
                      {reconciliationSummary?.totalImported.toLocaleString() || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Matched
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {reconciliationSummary?.totalMatched.toLocaleString() || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {reconciliationSummary?.totalPending.toLocaleString() || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Match Rate
                    </Typography>
                    <Typography variant="h4">
                      {reconciliationSummary?.matchRate
                        ? `${Math.round(reconciliationSummary.matchRate * 100)}%`
                        : '0%'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} mb={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    By Category
                  </Typography>
                  {categoryData.length > 0 ? (
                    <PieChart
                      series={[
                        {
                          data: categoryData,
                          highlightScope: { fade: 'global', highlight: 'item' },
                        },
                      ]}
                      height={300}
                    />
                  ) : (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height={300}
                    >
                      <Typography color="text.secondary">No data available</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    By Location
                  </Typography>
                  {locationData.length > 0 ? (
                    <BarChart
                      dataset={locationData}
                      xAxis={[{ scaleType: 'band', dataKey: 'location' }]}
                      series={[{ dataKey: 'amount', label: 'Amount' }]}
                      height={300}
                    />
                  ) : (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height={300}
                    >
                      <Typography color="text.secondary">No data available</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Distribution Details */}
            {distributionSummary && Object.keys(distributionSummary.byCategory).length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Distribution Breakdown
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Purpose</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(distributionSummary.byCategory).map(
                        ([category, data]) =>
                          data.distributions.map((dist, idx) => (
                            <TableRow key={`${category}-${idx}`}>
                              {idx === 0 && (
                                <TableCell rowSpan={data.distributions.length}>
                                  <Chip label={category} size="small" />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                  >
                                    Total: {data.total.toLocaleString()}
                                  </Typography>
                                </TableCell>
                              )}
                              <TableCell>{dist.purpose}</TableCell>
                              <TableCell align="right">{dist.percentage}%</TableCell>
                              <TableCell align="right">
                                {dist.amount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default FinancialReports;
