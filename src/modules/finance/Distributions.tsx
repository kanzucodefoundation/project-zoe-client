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
  useMediaQuery,
  useTheme,
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type { DistributionBatch, Distribution, BatchStatus } from './types';

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
  const theme = useTheme();
  // Dialogs fill the screen on a phone, as they do elsewhere in the app.
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [batches, setBatches] = useState<DistributionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<number | null>(null);
  // The list endpoint returns batches without their lines; details are
  // fetched the first time a batch is expanded and cached here.
  const [batchDetails, setBatchDetails] = useState<
    Record<number, Distribution[]>
  >({});
  const [loadingDetail, setLoadingDetail] = useState<number | null>(null);
  const [executingId, setExecutingId] = useState<number | null>(null);

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: '',
    periodStart: null as Dayjs | null,
    periodEnd: null as Dayjs | null,
  });

  const fetchBatches = () => {
    // Batch contents may have changed; drop the cache so an expand refetches.
    setBatchDetails({});
    setLoading(true);
    get(
      `${remoteRoutes.financialDistributions}/batches`,
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
        periodStart: newBatch.periodStart.format('YYYY-MM-DD'),
        periodEnd: newBatch.periodEnd.format('YYYY-MM-DD'),
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
    post(
      `${remoteRoutes.financialDistributions}/batches/${batchId}/submit`,
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
    post(
      `${remoteRoutes.financialDistributions}/batches/${batchId}/approve`,
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

    setExecutingId(batchId);
    post(
      `${remoteRoutes.financialDistributions}/batches/${batchId}/execute`,
      {},
      () => {
        setExecutingId(null);
        toast.success('Distribution executed');
        fetchBatches();
      },
      () => {
        setExecutingId(null);
        toast.error('Failed to execute distribution');
      }
    );
  };

/**
   * Postgres numeric columns arrive as strings, so formatting has to coerce
   * first — otherwise "1500.00" renders unseparated, and a null throws.
   */
  const money = (value: number | string | null | undefined) =>
    Number(value ?? 0).toLocaleString();

  const toggleExpand = (batchId: number) => {
    const next = expandedBatch === batchId ? null : batchId;
    setExpandedBatch(next);

    if (next === null || batchDetails[batchId]) {
      return;
    }

    setLoadingDetail(batchId);
    get(
      `${remoteRoutes.financialDistributions}/batches/${batchId}`,
      (data: DistributionBatch) => {
        setBatchDetails((prev) => ({
          ...prev,
          [batchId]: data.distributions ?? [],
        }));
        setLoadingDetail(null);
      },
      () => {
        setLoadingDetail(null);
        toast.error('Failed to load distribution lines');
      }
    );
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg">
        <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        mb={3}
      >
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
                      {money(batch.totalAmount)}
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
                        disabled={executingId === batch.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecute(batch.id);
                        }}
                      >
                        {executingId === batch.id ? 'Executing...' : 'Execute'}
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Distributions Detail */}
                <Collapse in={expandedBatch === batch.id}>
                  <Box px={2} pb={2}>
                    <TableContainer>
                      <Table size="small" sx={{ minWidth: 720 }}>
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
                          {batchDetails[batch.id] === undefined ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  py={1}
                                >
                                  {loadingDetail === batch.id
                                    ? 'Loading distribution lines…'
                                    : 'Distribution lines not loaded.'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : batchDetails[batch.id].length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  py={1}
                                >
                                  No distribution lines on this batch yet.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            batchDetails[batch.id].map((dist) => (
                              <TableRow key={dist.id}>
                                <TableCell>
                                  <Chip
                                    label={dist.category}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>{dist.description || '-'}</TableCell>
                                <TableCell>
                                  {dist.targetAccount?.name ||
                                    dist.targetGroup?.name ||
                                    '-'}
                                </TableCell>
                                <TableCell align="right">
                                  {dist.percentage != null
                                    ? `${Number(dist.percentage)}%`
                                    : '-'}
                                </TableCell>
                                <TableCell align="right">
                                  {money(dist.amount)}
                                </TableCell>
                                <TableCell>
                                  {/*
                                    A line is only actually paid out once its
                                    batch has been executed — the entity has no
                                    per-line transferred flag.
                                  */}
                                  {batch.status === 'EXECUTED' ? (
                                    <Chip
                                      label="Transferred"
                                      color="success"
                                      size="small"
                                    />
                                  ) : (
                                    <Chip
                                      label="Pending"
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
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
          fullScreen={isPhone}
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
                onChange={(date) => setNewBatch((prev) => ({ ...prev, periodStart: date as Dayjs | null }))}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />

              <DatePicker
                label="Period End"
                value={newBatch.periodEnd}
                onChange={(date) => setNewBatch((prev) => ({ ...prev, periodEnd: date as Dayjs | null }))}
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
