import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { get, post, put } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type { DistributionBatch, BatchStatus } from './types';

const getStatusColor = (status: BatchStatus): 'default' | 'warning' | 'info' | 'success' => {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'APPROVED':
      return 'info';
    case 'EXECUTED':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: BatchStatus) => {
  switch (status) {
    case 'DRAFT':
      return <ScheduleIcon />;
    case 'PENDING_APPROVAL':
      return <ScheduleIcon />;
    case 'APPROVED':
      return <CheckCircleIcon />;
    case 'EXECUTED':
      return <CheckCircleIcon />;
    default:
      return <ScheduleIcon />;
  }
};

const Distributions = () => {
  const [batches, setBatches] = useState<DistributionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<number | null>(null);

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: '',
    periodStart: null as Date | null,
    periodEnd: null as Date | null,
  });

  const fetchBatches = () => {
    setLoading(true);
    get(
      remoteRoutes.financialDistributions,
      (data: DistributionBatch[]) => {
        setBatches(data);
        setLoading(false);
      },
      () => {
        toast.error('Failed to load distribution batches');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreate = () => {
    if (!newBatch.name || !newBatch.periodStart || !newBatch.periodEnd) {
      toast.error('Please fill in all fields');
      return;
    }

    setCreating(true);

    post(
      `${remoteRoutes.financialDistributions}/calculate`,
      {
        name: newBatch.name,
        periodStart: newBatch.periodStart.toISOString().split('T')[0],
        periodEnd: newBatch.periodEnd.toISOString().split('T')[0],
        includeApprovedOnly: true,
      },
      () => {
        toast.success('Distribution batch created');
        setCreating(false);
        setCreateDialogOpen(false);
        setNewBatch({ name: '', periodStart: null, periodEnd: null });
        fetchBatches();
      },
      (err: any) => {
        toast.error(err?.message || 'Failed to create batch');
        setCreating(false);
      }
    );
  };

  const handleSubmitForApproval = (batchId: number) => {
    put(
      `${remoteRoutes.financialDistributions}/${batchId}/submit`,
      {},
      () => {
        toast.success('Batch submitted for approval');
        fetchBatches();
      },
      () => {
        toast.error('Failed to submit batch');
      }
    );
  };

  const handleApprove = (batchId: number) => {
    put(
      `${remoteRoutes.financialDistributions}/${batchId}/approve`,
      {},
      () => {
        toast.success('Batch approved');
        fetchBatches();
      },
      () => {
        toast.error('Failed to approve batch');
      }
    );
  };

  const handleExecute = (batchId: number) => {
    if (!window.confirm('Are you sure you want to execute this distribution? This action cannot be undone.')) {
      return;
    }

    put(
      `${remoteRoutes.financialDistributions}/${batchId}/execute`,
      {},
      () => {
        toast.success('Distribution executed');
        fetchBatches();
      },
      () => {
        toast.error('Failed to execute distribution');
      }
    );
  };

  const toggleExpand = (batchId: number) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Distributions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Distribution
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Distributions calculate how reconciled funds should be allocated based on category rules
          (e.g., 10% of tithes to headquarters, 90% to local church).
        </Alert>

        {/* Batches List */}
        {batches.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No distribution batches yet. Create one to get started.
            </Typography>
          </Paper>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {batches.map((batch) => (
              <Paper key={batch.id}>
                {/* Batch Header */}
                <Box
                  display="flex"
                  alignItems="center"
                  p={2}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => toggleExpand(batch.id)}
                >
                  <IconButton size="small">
                    {expandedBatch === batch.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <Box flex={1} ml={1}>
                    <Typography fontWeight={500}>{batch.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(batch.periodStart).toLocaleDateString()} -{' '}
                      {new Date(batch.periodEnd).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">
                      {batch.totalAmount.toLocaleString()}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(batch.status)}
                      label={batch.status.replace('_', ' ')}
                      color={getStatusColor(batch.status)}
                      size="small"
                    />
                    {batch.status === 'DRAFT' && (
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubmitForApproval(batch.id);
                        }}
                      >
                        Submit
                      </Button>
                    )}
                    {batch.status === 'PENDING_APPROVAL' && (
                      <Button
                        size="small"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(batch.id);
                        }}
                      >
                        Approve
                      </Button>
                    )}
                    {batch.status === 'APPROVED' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecute(batch.id);
                        }}
                      >
                        Execute
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Distributions Detail */}
                <Collapse in={expandedBatch === batch.id}>
                  <Box px={2} pb={2}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Purpose</TableCell>
                            <TableCell>Destination</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {batch.distributions.map((dist) => (
                            <TableRow key={dist.id}>
                              <TableCell>
                                <Chip label={dist.category} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>{dist.purpose}</TableCell>
                              <TableCell>
                                {dist.toAccount?.name || dist.toLocation?.name || '-'}
                              </TableCell>
                              <TableCell align="right">
                                {dist.percentage ? `${dist.percentage}%` : '-'}
                              </TableCell>
                              <TableCell align="right">
                                {dist.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {dist.transferred ? (
                                  <Chip
                                    label="Transferred"
                                    color="success"
                                    size="small"
                                  />
                                ) : (
                                  <Chip label="Pending" size="small" variant="outlined" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </Box>
        )}

        {/* Create Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Distribution Batch</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3} mt={1}>
              <TextField
                label="Batch Name"
                value={newBatch.name}
                onChange={(e) => setNewBatch((prev) => ({ ...prev, name: e.target.value }))}
                fullWidth
                placeholder="e.g., January 2024 Distribution"
              />

              <DatePicker
                label="Period Start"
                value={newBatch.periodStart}
                onChange={(date) => setNewBatch((prev) => ({ ...prev, periodStart: date }))}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />

              <DatePicker
                label="Period End"
                value={newBatch.periodEnd}
                onChange={(date) => setNewBatch((prev) => ({ ...prev, periodEnd: date }))}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={creating}
              startIcon={creating ? <CircularProgress size={20} /> : null}
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default Distributions;
