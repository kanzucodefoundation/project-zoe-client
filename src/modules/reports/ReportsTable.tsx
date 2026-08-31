import { useState } from 'react';
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
  Menu,
  MenuItem,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import type { Column, SubmissionRow } from '../../utils/types';

interface Props {
  columns: Column[];
  data: SubmissionRow[];
  loading: boolean;
  onRowClick: (row: SubmissionRow) => void;
  onEditClick: (row: SubmissionRow) => void;
}

const ReportsTable = ({ columns, data, loading, onRowClick, onEditClick }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<SubmissionRow | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    row: SubmissionRow,
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
    if (selectedRow) onRowClick(selectedRow);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedRow) onEditClick(selectedRow);
    handleMenuClose();
  };

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
        <Typography color="textSecondary">
          No submissions found for this report
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.paper' }}>
            {columns.map((col) => (
              <TableCell
                key={col.name}
                sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
              >
                {col.label}
              </TableCell>
            ))}
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              Submitted By
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              Submitted At
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              Actions
            </TableCell>
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
                {typeof row.submittedBy === 'object'
                  ? row.submittedBy?.name || '-'
                  : row.submittedBy || '-'}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {formatCell(row.submittedAt)}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, row)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        {selectedRow?.canEdit && (
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
        )}
      </Menu>
    </TableContainer>
  );
};

export default ReportsTable;
