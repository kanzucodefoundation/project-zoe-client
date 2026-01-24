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
  IconButton,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

interface Column {
  name: string;
  label: string;
}

interface Props {
  columns: Column[];
  data: Record<string, any>[];
  loading: boolean;
  onRowClick: (row: Record<string, any>) => void;
}

const ReportsTable = ({ columns, data, loading, onRowClick }: Props) => {
  const formatCell = (value: any): string => {
    if (value === null || value === undefined) return '-';
    // Try to detect ISO date strings
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    }
    if (typeof value === 'object') return value.name || JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Typography color="textSecondary">No submissions found for this report</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.100' }}>
            {columns.map((col) => (
              <TableCell key={col.name} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {col.label}
              </TableCell>
            ))}
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Submitted By</TableCell>
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Submitted At</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow
              key={row.id || idx}
              hover
              onClick={() => onRowClick(row)}
              sx={{ cursor: 'pointer' }}
            >
              {columns.map((col) => (
                <TableCell key={col.name} sx={{ whiteSpace: 'nowrap' }}>
                  {formatCell(row.data?.[col.name])}
                </TableCell>
              ))}
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {typeof row.submittedBy === 'object' ? row.submittedBy?.name || '-' : row.submittedBy || '-'}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {formatCell(row.submittedAt)}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRowClick(row); }}>
                  <MoreVert fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportsTable;
