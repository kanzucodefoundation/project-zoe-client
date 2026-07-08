import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import {
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';
import { useRetentionReport } from '../tasks/hooks';
import type {
  RetentionSummary,
  RetentionMonthData,
  RetentionReport,
  RetentionWeekData,
  RetentionWeekReport,
} from '../../utils/types';

type Window = 'week' | 'month' | '90days' | 'ytd';

const WINDOW_LABELS: Record<Window, string> = {
  week: 'This Week',
  month: 'This Month',
  '90days': 'Last 90 Days',
  ytd: 'Year to Date',
};

function getPeriodRange(window: Window) {
  const today = new Date();

  if (window === 'week') {
    return {
      label: WINDOW_LABELS[window],
      from: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    };
  }

  if (window === 'month') {
    return {
      label: WINDOW_LABELS[window],
      from: format(startOfMonth(today), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    };
  }

  if (window === '90days') {
    return {
      label: WINDOW_LABELS[window],
      from: format(subDays(today, 89), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    };
  }

  return {
    label: WINDOW_LABELS[window],
    from: format(startOfYear(today), 'yyyy-MM-dd'),
    to: format(today, 'yyyy-MM-dd'),
  };
}

const SUMMARY_CARDS: Array<{ label: string; key: keyof RetentionSummary }> = [
  { label: 'Recorded', key: 'recorded' },
  { label: 'Retained', key: 'retained' },
  { label: 'Unreachable', key: 'unreachable' },
  { label: 'Joined Fellowship', key: 'joinedFellowship' },
  { label: 'Joined Serving Team', key: 'joinedServingTeam' },
  { label: 'Baptised', key: 'baptised' },
];

const MONTH_CARDS: Array<{ label: string; key: keyof RetentionMonthData }> = [
  { label: 'New Contacts', key: 'totalNewContacts' },
  { label: 'Successful Calls', key: 'successfulCallsMade' },
  { label: 'Want to Join MC', key: 'wantToJoinMC' },
  { label: 'Unreachable', key: 'unreachable' },
  { label: 'Serving Team', key: 'servingTeam' },
  { label: 'Matched', key: 'teaHangout' },
  { label: 'Baptism', key: 'baptism' },
];

const WEEK_CARDS: Array<{ label: string; key: keyof RetentionWeekData }> = [
  { label: 'New Contacts', key: 'totalNewContacts' },
  { label: 'Successful Calls', key: 'successfulCallsMade' },
  { label: 'Want to Join MC', key: 'wantToJoinMC' },
  { label: 'Unreachable', key: 'unreachable' },
  { label: 'Serving Team', key: 'servingTeams' },
  { label: 'Matched', key: 'teaHangout' },
  { label: 'Baptism', key: 'baptism' },
];

function isMonthReport(
  data: RetentionSummary | RetentionReport | RetentionWeekReport,
): data is RetentionReport {
  return 'months' in data;
}

function isWeekReport(
  data: RetentionSummary | RetentionReport | RetentionWeekReport,
): data is RetentionWeekReport {
  return 'weeks' in data;
}

function getCurrentWeekSunday(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // subtract day-of-week (0 = Sunday)
  return format(d, 'yyyy-MM-dd');
}

/**
 * Renders the retention report page with window selection, report summaries, and Excel export.
 */
export default function RetentionReport() {
  const [selectedWindow, setSelectedWindow] = useState<Window>('month');
  const { data, isLoading } = useRetentionReport(selectedWindow);
  const selectedPeriod = getPeriodRange(selectedWindow);

  const currentWeekSunday = getCurrentWeekSunday();
  const currentMonthNum = new Date().getMonth() + 1;

  const handleDownload = async () => {
    if (!data) {
      toast.warning('No retention data to export');
      return;
    }

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Retention Report');

    let exportData: Record<string, unknown>[];
    if (isMonthReport(data)) {
      exportData = data.months.map((m) => ({
        Month: m.monthName,
        'New Contacts': m.totalNewContacts,
        'Successful Calls': m.successfulCallsMade,
        'Want to Join MC': m.wantToJoinMC,
        Unreachable: m.unreachable,
        'Serving Team': m.servingTeam,
        Matched: m.teaHangout,
        Baptism: m.baptism,
      }));
    } else if (isWeekReport(data)) {
      exportData = data.weeks.map((w) => ({
        Week: w.label,
        'Week Start': w.weekStart,
        'New Contacts': w.totalNewContacts,
        'Successful Calls': w.successfulCallsMade,
        'Want to Join MC': w.wantToJoinMC,
        Unreachable: w.unreachable,
        'Serving Team': w.servingTeams,
        Matched: w.teaHangout,
        Baptism: w.baptism,
      }));
    } else {
      exportData = [
        {
          Period: selectedPeriod.label,
          'Period Start': selectedPeriod.from,
          'Period End': selectedPeriod.to,
          Recorded: data.recorded,
          Retained: data.retained,
          Unreachable: data.unreachable,
          'Joined Fellowship': data.joinedFellowship,
          'Joined Serving Team': data.joinedServingTeam,
          Baptised: data.baptised,
        },
      ];
    }

    if (exportData.length > 0) {
      worksheet.columns = Object.keys(exportData[0]).map((key) => ({ header: key, key }));
      exportData.forEach((row) => worksheet.addRow(row));
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retention_report_${selectedWindow}_${dateStr}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Retention report downloaded successfully');
  };

  const yearLabel =
    data && (isMonthReport(data) || isWeekReport(data))
      ? ` — ${data.year}`
      : '';

  return (
    <Container maxWidth="lg">
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
        flexWrap="wrap"
      >
        <Typography variant="h4">Retention Report{yearLabel}</Typography>
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <ToggleButtonGroup
            exclusive
            value={selectedWindow}
            onChange={(_, val) => val && setSelectedWindow(val)}
          >
            <ToggleButton value="week">This Week</ToggleButton>
            <ToggleButton value="month">This Month</ToggleButton>
            <ToggleButton value="90days">Last 90 Days</ToggleButton>
            <ToggleButton value="ytd">Year to Date</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
      >
        <Typography variant="body2" color="text.secondary">
          {data && (isMonthReport(data) || isWeekReport(data))
            ? WINDOW_LABELS[selectedWindow]
            : `Period: ${selectedPeriod.from} to ${selectedPeriod.to}`}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon fontSize="small" />}
          onClick={handleDownload}
          disabled={isLoading || !data}
          sx={{ textTransform: 'none' }}
        >
          Download Excel
        </Button>
      </Box>

      {/* Flat summary view: 90days / ytd */}
      {(!data || (!isMonthReport(data) && !isWeekReport(data))) && (
        <Grid container spacing={3}>
          {SUMMARY_CARDS.map(({ label, key }) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={key}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <CardContent>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" mb={1}>
                      <Skeleton variant="rectangular" width={60} height={60} />
                    </Box>
                  ) : (
                    <Typography variant="h3" fontWeight="bold">
                      {(data as RetentionSummary)?.[key] ?? 0}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Monthly view: totals cards + breakdown table */}
      {data && isMonthReport(data) && (
        <>
          <Grid container spacing={3} mb={4}>
            {MONTH_CARDS.map(({ label, key }) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }} key={key}>
                <Card sx={{ textAlign: 'center', p: 1 }}>
                  <CardContent>
                    {isLoading ? (
                      <Box display="flex" justifyContent="center" mb={1}>
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={60}
                        />
                      </Box>
                    ) : (
                      <Typography variant="h3" fontWeight="bold">
                        {
                          (data.months.find(
                            (m) => m.month === currentMonthNum,
                          )?.[key] ?? 0) as number
                        }
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Month</strong>
                  </TableCell>
                  {MONTH_CARDS.map(({ label }) => (
                    <TableCell key={label} align="center">
                      <strong>{label}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.months.map((m) => (
                  <TableRow key={m.month} hover>
                    <TableCell>{m.monthName}</TableCell>
                    {MONTH_CARDS.map(({ key }) => (
                      <TableCell key={key} align="center">
                        {m[key] as number}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Weekly view: totals cards + breakdown table */}
      {data && isWeekReport(data) && (
        <>
          <Grid container spacing={3} mb={4}>
            {WEEK_CARDS.map(({ label, key }) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }} key={key}>
                <Card sx={{ textAlign: 'center', p: 1 }}>
                  <CardContent>
                    {isLoading ? (
                      <Box display="flex" justifyContent="center" mb={1}>
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={60}
                        />
                      </Box>
                    ) : (
                      <Typography variant="h3" fontWeight="bold">
                        {
                          (data.weeks.find(
                            (w) => w.weekStart === currentWeekSunday,
                          )?.[key] ?? 0) as number
                        }
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Week</strong>
                  </TableCell>
                  {WEEK_CARDS.map(({ label }) => (
                    <TableCell key={label} align="center">
                      <strong>{label}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.weeks.map((w) => (
                  <TableRow key={w.weekStart} hover>
                    <TableCell>{w.label}</TableCell>
                    {WEEK_CARDS.map(({ key }) => (
                      <TableCell key={key} align="center">
                        {w[key] as number}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}
