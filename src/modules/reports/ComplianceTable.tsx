import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Tooltip,
} from '@mui/material';
import { format, parseISO } from 'date-fns';

export interface ComplianceRow {
  groupId: number;
  groupName: string;
  leaderName: string;
  weeksInRange: number;
  weeksMissed: number;
  missedWeeks: string[];
  missingCurrentWeek: boolean;
}

interface Props {
  rows: ComplianceRow[];
  loading: boolean;
  showWeeksMissed?: boolean;
}

const formatWeek = (isoDate: string): string => format(parseISO(isoDate), 'MMM d');

const ComplianceTable = ({ rows, loading, showWeeksMissed = true }: Props) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Typography color="textSecondary">
          All MC leaders have submitted for the selected period
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.paper' }}>
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>MC Leader</TableCell>
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>MC Group</TableCell>
            {showWeeksMissed && (
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">
                Weeks missed
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.groupId} hover>
              <TableCell sx={{ whiteSpace: 'nowrap', py:2 }}>{row.leaderName}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py:2  }}>{row.groupName}</TableCell>
              {showWeeksMissed && (
                <TableCell align="right">
                  <Tooltip title={row.missedWeeks.map(formatWeek).join(', ')}>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ py:2, fontWeight:500  }}
                    >
                      {row.weeksMissed} / {row.weeksInRange}
                    </Typography>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ComplianceTable;
