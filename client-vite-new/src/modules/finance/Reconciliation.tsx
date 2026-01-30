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
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Tabs,
  Tab,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, post, put } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type {
  Transaction,
  FinancialAccount,
  TransactionStatus,
  MatchSuggestion,
} from './types';

interface ContactOption {
  id: number;
  name: string;
  phone?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const getStatusColor = (status: TransactionStatus): 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'RECONCILED':
      return 'success';
    case 'DISPUTED':
      return 'error';
    default:
      return 'warning';
  }
};

const Reconciliation = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('PENDING');
  const [accountFilter, setAccountFilter] = useState<number | 'ALL'>('ALL');
  const [tabValue, setTabValue] = useState(0);

  // Match dialog
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    if (accountFilter !== 'ALL') params.append('accountId', accountFilter.toString());

    get(
      `${remoteRoutes.financialTransactions}?${params.toString()}`,
      (data: Transaction[]) => {
        setTransactions(data);
        setLoading(false);
      },
      () => {
        toast.error('Failed to load transactions');
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
    fetchTransactions();
  }, [statusFilter, accountFilter]);

  const handleOpenMatchDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSelectedContact(null);
    setMatchDialogOpen(true);
    setLoadingSuggestions(true);

    // Fetch suggestions for this transaction
    get(
      `${remoteRoutes.financialReconciliation}/suggestions/${transaction.id}`,
      (data: MatchSuggestion[]) => {
        setSuggestions(data);
        setLoadingSuggestions(false);
      },
      () => {
        setSuggestions([]);
        setLoadingSuggestions(false);
      }
    );

    // Fetch contacts for manual matching
    get(
      `${remoteRoutes.contactsPeopleCombo}`,
      (data: ContactOption[]) => {
        setContacts(data);
      },
      () => {}
    );
  };

  const handleMatch = (contactId?: number) => {
    if (!selectedTransaction) return;

    const contact = contactId
      ? { id: contactId }
      : selectedContact
      ? { id: selectedContact.id }
      : null;

    if (!contact) {
      toast.error('Please select a contact');
      return;
    }

    setSaving(true);

    post(
      `${remoteRoutes.financialReconciliation}/match`,
      {
        transactionId: selectedTransaction.id,
        contactId: contact.id,
        matchType: 'MANUAL',
      },
      () => {
        toast.success('Transaction matched successfully');
        setSaving(false);
        setMatchDialogOpen(false);
        fetchTransactions();
      },
      (err: any) => {
        toast.error(err?.message || 'Failed to match transaction');
        setSaving(false);
      }
    );
  };

  const handleApproveMatch = (transactionId: number) => {
    put(
      `${remoteRoutes.financialReconciliation}/approve/${transactionId}`,
      {},
      () => {
        toast.success('Match approved');
        fetchTransactions();
      },
      () => {
        toast.error('Failed to approve match');
      }
    );
  };

  const handleRejectMatch = (transactionId: number) => {
    put(
      `${remoteRoutes.financialReconciliation}/reject/${transactionId}`,
      {},
      () => {
        toast.success('Match rejected');
        fetchTransactions();
      },
      () => {
        toast.error('Failed to reject match');
      }
    );
  };

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.senderName?.toLowerCase().includes(search.toLowerCase()) ||
      tx.senderPhone?.includes(search) ||
      tx.narration?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = transactions.filter((tx) => tx.status === 'PENDING').length;
  const reconciledCount = transactions.filter((tx) => tx.status === 'RECONCILED').length;

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reconciliation</Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchTransactions}>
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box display="flex" gap={2} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Pending
          </Typography>
          <Typography variant="h4" color="warning.main">
            {pendingCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Reconciled
          </Typography>
          <Typography variant="h4" color="success.main">
            {reconciledCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Match Rate
          </Typography>
          <Typography variant="h4">
            {transactions.length > 0
              ? Math.round((reconciledCount / transactions.length) * 100)
              : 0}
            %
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2 }}>
        {/* Filters */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <TextField
            placeholder="Search by name, phone, or narration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'ALL')}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="RECONCILED">Reconciled</MenuItem>
              <MenuItem value="DISPUTED">Disputed</MenuItem>
            </Select>
          </FormControl>

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

        {/* Transactions Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Sender</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Match</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={4}>
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{tx.senderName || '-'}</TableCell>
                      <TableCell>{tx.senderPhone || '-'}</TableCell>
                      <TableCell align="right">
                        {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.category || 'Uncategorized'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status}
                          size="small"
                          color={getStatusColor(tx.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {tx.reconciliationMatch?.contact ? (
                          <Tooltip title={`Matched to ${tx.reconciliationMatch.contact.name}`}>
                            <Chip
                              icon={<PersonIcon />}
                              label={tx.reconciliationMatch.contact.name}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {tx.status === 'PENDING' && (
                          <Tooltip title="Match to contact">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenMatchDialog(tx)}
                            >
                              <LinkIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {tx.status === 'RECONCILED' &&
                          tx.reconciliationMatch?.status === 'PENDING' && (
                            <>
                              <Tooltip title="Approve match">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApproveMatch(tx.id)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject match">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRejectMatch(tx.id)}
                                >
                                  <WarningIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Match Dialog */}
      <Dialog
        open={matchDialogOpen}
        onClose={() => setMatchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Match Transaction</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary">
                Transaction Details
              </Typography>
              <Typography>
                <strong>Sender:</strong> {selectedTransaction.senderName || 'Unknown'}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selectedTransaction.senderPhone || 'N/A'}
              </Typography>
              <Typography>
                <strong>Amount:</strong> {selectedTransaction.amount.toLocaleString()}
              </Typography>
              <Typography>
                <strong>Date:</strong>{' '}
                {new Date(selectedTransaction.transactionDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}

          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Suggestions" />
            <Tab label="Manual Match" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {loadingSuggestions ? (
              <Box py={2}>
                <LinearProgress />
              </Box>
            ) : suggestions.length === 0 ? (
              <Typography color="text.secondary" py={2}>
                No suggestions found. Try manual matching.
              </Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={1}>
                {suggestions.map((suggestion) => (
                  <Paper
                    key={suggestion.contact.id}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => handleMatch(suggestion.contact.id)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight={500}>
                          {suggestion.contact.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {suggestion.contact.phone || suggestion.contact.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {suggestion.matchReasons.join(', ')}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${Math.round(suggestion.confidenceScore * 100)}%`}
                        color={suggestion.confidenceScore > 0.8 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Autocomplete
              options={contacts}
              getOptionLabel={(option) =>
                `${option.name}${option.phone ? ` (${option.phone})` : ''}`
              }
              value={selectedContact}
              onChange={(_, value) => setSelectedContact(value)}
              renderInput={(params) => (
                <TextField {...params} label="Search contact" fullWidth />
              )}
            />
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatchDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          {tabValue === 1 && (
            <Button
              variant="contained"
              onClick={() => handleMatch()}
              disabled={!selectedContact || saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? 'Matching...' : 'Match'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reconciliation;
