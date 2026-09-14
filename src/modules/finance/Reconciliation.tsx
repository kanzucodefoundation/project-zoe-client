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
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoMatchIcon,
  DoneAll as ApproveAllIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, getAsync, post, put } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { TransactionStatus } from './types';
import QuickBooksPostingPanel from './QuickBooksPostingPanel';
import type {
  Transaction,
  FinancialAccount,
  MatchSuggestion,
} from './types';

interface PostFailure {
  transactionId: number;
  status: 'POSTED' | 'FAILED';
  /** The giver's name, so a failure can be acted on without looking up an id. */
  giver: string;
  amount: number;
  transactionDate: string;
  error?: string;
}

interface BatchPostResult {
  posted: number;
  failed: number;
  results: PostFailure[];
}

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

/** Server errors reach these callbacks as Errors carrying the API's message. */
const errorMessage = (e: unknown, fallback: string): string =>
  e instanceof Error && e.message ? e.message : fallback;

/**
 * Filter values. PENDING/RECONCILED/DISPUTED are transaction statuses the
 * server understands; POSTED and NOT_POSTED describe whether the transaction
 * has reached QuickBooks, which lives on the posting rather than the status,
 * so those two are applied in the browser.
 */
type StatusFilter = TransactionStatus | 'ALL' | 'POSTED' | 'NOT_POSTED';

const isServerStatus = (filter: StatusFilter): filter is TransactionStatus =>
  filter !== 'ALL' && filter !== 'POSTED' && filter !== 'NOT_POSTED';

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

/**
 * Matches at or above this score are the ones "Approve All High Confidence"
 * acts on, per the reconciliation tutorial.
 */
const HIGH_CONFIDENCE = 90;

const Reconciliation = () => {
  const theme = useTheme();
  // Dialogs fill the screen on a phone, as they do elsewhere in the app.
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    TransactionStatus.PENDING,
  );
  const [accountFilter, setAccountFilter] = useState<number | 'ALL'>('ALL');
  const [tabValue, setTabValue] = useState(0);

  // Match dialog
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [contactQuery, setContactQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const [saving, setSaving] = useState(false);

  // Auto-match and bulk approval
  const [running, setRunning] = useState(false);
  const [approving, setApproving] = useState(false);
  const [selectedMatchIds, setSelectedMatchIds] = useState<number[]>([]);
  // Transaction whose approve/reject request is in flight, so both controls
  // on that row can be disabled without freezing the whole table.
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const fetchTransactions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (isServerStatus(statusFilter)) params.append('status', statusFilter);
    if (accountFilter !== 'ALL') params.append('accountId', accountFilter.toString());

    get(
      `${remoteRoutes.financialTransactions}?${params.toString()}`,
      (data: Transaction[]) => {
        setTransactions(data);
        // Ids from the previous list no longer mean anything.
        setSelectedTxnIds([]);
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

  // Selections are only meaningful against the rows on screen. Without this,
  // ticking matches on one account, switching accounts and approving would
  // silently approve the hidden ones.
  useEffect(() => {
    setSelectedMatchIds([]);
  }, [statusFilter, accountFilter, search]);

  /**
   * Runs the matching engine over one account. The endpoint needs a specific
   * account, so this is only offered once the account filter is narrowed.
   */
  const handleRunAutoMatch = () => {
    if (accountFilter === 'ALL') {
      toast.info('Choose an account first — auto-match runs one account at a time');
      return;
    }

    setRunning(true);
    post(
      `${remoteRoutes.financialReconciliation}/run`,
      {
        accountId: accountFilter,
        minConfidenceThreshold: 60,
      },
      (result: {
        processed: number;
        matched: number;
        autoApproved: number;
        errors: string[];
      }) => {
        setRunning(false);
        toast.success(
          `Matched ${result.matched} of ${result.processed} transactions`,
        );
        if (result.errors?.length) {
          toast.warning(`${result.errors.length} could not be matched`);
        }
        setSelectedMatchIds([]);
        fetchTransactions();
      },
      (err: unknown) => {
        setRunning(false);
        toast.error(err instanceof Error ? err.message : 'Auto-match failed');
      },
    );
  };

  /** Removes a transaction's match from the selection once it is resolved. */
  const dropFromSelection = (transactionId: number) => {
    const matchId = transactions.find((tx) => tx.id === transactionId)
      ?.reconciliationMatch?.id;

    if (matchId) {
      setSelectedMatchIds((prev) => prev.filter((id) => id !== matchId));
    }
  };

  const toggleMatchSelection = (matchId: number) => {
    setSelectedMatchIds((prev) =>
      prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId],
    );
  };

  /** Ticks every pending match scoring at or above the high-confidence mark. */
  const selectHighConfidence = () => {
    setSelectedMatchIds(
      pendingMatches
        .filter((match) => (match.confidenceScore ?? 0) >= HIGH_CONFIDENCE)
        .map((match) => match.id),
    );
  };

  const handleBulkApprove = () => {
    // Belt and braces: only ever submit ids that are still pending and on
    // screen, even if something changed between selection and click.
    const visibleIds = selectedMatchIds.filter((id) =>
      pendingMatches.some((match) => match.id === id),
    );

    if (visibleIds.length === 0) {
      setSelectedMatchIds([]);
      return;
    }

    setApproving(true);
    post(
      `${remoteRoutes.financialReconciliation}/bulk-approve`,
      { matchIds: visibleIds },
      (result: { approved: number; errors: string[] }) => {
        setApproving(false);
        toast.success(`Approved ${result.approved} matches`);
        if (result.errors?.length) {
          toast.warning(`${result.errors.length} could not be approved`);
        }
        setSelectedMatchIds([]);
        fetchTransactions();
      },
      (err: unknown) => {
        setApproving(false);
        toast.error(
          err instanceof Error ? err.message : 'Bulk approval failed',
        );
      },
    );
  };

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

    // Contacts are searched server-side — see the effect below. Loading a
    // fixed page here meant anyone past the first 100 could never be found.
    setContactQuery('');
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
      `${remoteRoutes.financialReconciliation}/matches`,
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
    setResolvingId(transactionId);
    put(
      `${remoteRoutes.financialReconciliation}/approve/${transactionId}`,
      {},
      () => {
        toast.success('Match approved');
        setResolvingId(null);
        dropFromSelection(transactionId);
        fetchTransactions();
      },
      () => {
        setResolvingId(null);
        toast.error('Failed to approve match');
      }
    );
  };

  const handleRejectMatch = (transactionId: number) => {
    setResolvingId(transactionId);
    put(
      `${remoteRoutes.financialReconciliation}/reject/${transactionId}`,
      {},
      () => {
        toast.success('Match rejected');
        setResolvingId(null);
        dropFromSelection(transactionId);
        fetchTransactions();
      },
      () => {
        setResolvingId(null);
        toast.error('Failed to reject match');
      }
    );
  };

  /**
   * Searches contacts as the operator types.
   *
   * The endpoint pages at 100 by default, so fetching once and filtering in the
   * browser silently hid every contact past the first page. Sending the term to
   * the server instead means anyone in the CRM can be found, however many there
   * are. Debounced so a keystroke does not become a request.
   */
  useEffect(() => {
    if (!matchDialogOpen) return undefined;

    const handle = setTimeout(() => {
      setLoadingContacts(true);
      getAsync<ContactOption[]>(remoteRoutes.contacts, {
        ...(contactQuery.trim() ? { query: contactQuery.trim() } : {}),
        limit: 50,
      })
        .then((data) => setContacts(data ?? []))
        .catch(() => setContacts([]))
        .finally(() => setLoadingContacts(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [contactQuery, matchDialogOpen]);

  const handleRunAutoMatch = () => {
    setAutoMatching(true);
    post(
      `${remoteRoutes.financialReconciliation}/run`,
      {
        ...(accountFilter !== 'ALL' ? { accountId: accountFilter } : {}),
      },
      (result: { processed: number; matched: number; autoApproved: number }) => {
        toast.success(
          `Matched ${result.matched} of ${result.processed} transactions` +
            (result.autoApproved
              ? `, ${result.autoApproved} auto-approved`
              : ''),
        );
        setAutoMatching(false);
        fetchTransactions();
      },
      (err: unknown) => {
        toast.error(errorMessage(err, 'Auto-match failed'));
        setAutoMatching(false);
      },
    );
  };

  const handleBulkApprove = () => {
    if (approvableMatchIds.length === 0) return;
    setBulkApproving(true);
    post(
      `${remoteRoutes.financialReconciliation}/bulk-approve`,
      { matchIds: approvableMatchIds },
      (result: { approved: number; errors: string[] }) => {
        toast.success(`Approved ${result.approved} matches`);
        if (result.errors?.length) {
          toast.warning(`${result.errors.length} could not be approved`);
        }
        setBulkApproving(false);
        fetchTransactions();
      },
      (err: unknown) => {
        toast.error(errorMessage(err, 'Bulk approval failed'));
        setBulkApproving(false);
      },
    );
  };

  const handleBulkPost = () => {
    if (postableTxnIds.length === 0) return;
    setBulkPosting(true);
    setPostFailures([]);
    post(
      `${remoteRoutes.financialAccountingBatch}/post-batch`,
      { transactionIds: postableTxnIds },
      (result: BatchPostResult) => {
        if (result.posted > 0) {
          toast.success(`Posted ${result.posted} to QuickBooks`);
        }
        // Every transaction is attempted, so a failure here is about those
        // specific gifts — the rest have already gone across.
        setPostFailures(
          result.results.filter((r) => r.status === 'FAILED'),
        );
        if (result.failed > 0) {
          toast.warning(
            `${result.failed} could not be posted — see the list below`,
          );
        }
        setBulkPosting(false);
        fetchTransactions();
      },
      (err: unknown) => {
        toast.error(errorMessage(err, 'Bulk posting failed'));
        setBulkPosting(false);
      },
    );
  };

  const filteredTransactions = transactions
    .filter((tx) => {
      if (statusFilter === 'POSTED') return !!tx.accountingPosting;
      if (statusFilter === 'NOT_POSTED') return !tx.accountingPosting;
      return true;
    })
    .filter(
      (tx) =>
        tx.senderName?.toLowerCase().includes(search.toLowerCase()) ||
        tx.senderPhone?.includes(search) ||
        tx.narration?.toLowerCase().includes(search.toLowerCase())
    );

  // Matches awaiting a decision — what the bulk controls operate on.
  const pendingMatches = filteredTransactions
    .map((tx) => tx.reconciliationMatch)
    .filter(
      (match): match is NonNullable<Transaction['reconciliationMatch']> =>
        !!match && match.status === 'PENDING',
    );
  const highConfidenceCount = pendingMatches.filter(
    (match) => (match.confidenceScore ?? 0) >= HIGH_CONFIDENCE,
  ).length;

  const pendingCount = transactions.filter((tx) => tx.status === 'PENDING').length;
  const reconciledCount = transactions.filter((tx) => tx.status === 'RECONCILED').length;

  // A row is actionable when it has a match and has not already reached
  // QuickBooks. Re-posting a receipt would either be rejected or duplicate it,
  // so posted rows carry no checkbox and no action at all.
  const actionableTxns = filteredTransactions.filter(
    (tx) =>
      !tx.accountingPosting &&
      (tx.reconciliationMatch?.status === 'PENDING' ||
        tx.reconciliationMatch?.status === 'APPROVED'),
  );
  const actionableIds = actionableTxns.map((tx) => tx.id);

  const selectedTxns = filteredTransactions.filter((tx) =>
    selectedTxnIds.includes(tx.id),
  );
  // flatMap rather than filter-then-map so the match is provably defined,
  // without asserting it.
  const approvableMatchIds = selectedTxns.flatMap((tx) =>
    tx.reconciliationMatch?.status === 'PENDING'
      ? [tx.reconciliationMatch.id]
      : [],
  );
  const postableTxnIds = selectedTxns
    .filter(
      (tx) =>
        tx.reconciliationMatch?.status === 'APPROVED' && !tx.accountingPosting,
    )
    .map((tx) => tx.id);

  const allSelected =
    actionableIds.length > 0 &&
    actionableIds.every((id) => selectedTxnIds.includes(id));
  const someSelected = selectedTxnIds.length > 0 && !allSelected;

  const toggleAll = () => setSelectedTxnIds(allSelected ? [] : actionableIds);

  const toggleOne = (txnId: number) =>
    setSelectedTxnIds((prev) =>
      prev.includes(txnId)
        ? prev.filter((id) => id !== txnId)
        : [...prev, txnId],
    );

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Typography variant="h4">Reconciliation</Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Tooltip
            title={
              accountFilter === 'ALL'
                ? 'Choose an account to run auto-match'
                : 'Find contacts for unmatched transactions on this account'
            }
          >
            <span>
              <Button
                variant="contained"
                startIcon={<AutoMatchIcon />}
                onClick={handleRunAutoMatch}
                disabled={running || accountFilter === 'ALL'}
              >
                {running ? 'Matching...' : 'Run Auto-Match'}
              </Button>
            </span>
          </Tooltip>
          <Button startIcon={<RefreshIcon />} onClick={fetchTransactions}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Paper sx={{ p: 2, flex: '1 1 140px', minWidth: 140 }}>
          <Typography variant="body2" color="text.secondary">
            Pending
          </Typography>
          <Typography variant="h4" color="warning.main">
            {pendingCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 140px', minWidth: 140 }}>
          <Typography variant="body2" color="text.secondary">
            Reconciled
          </Typography>
          <Typography variant="h4" color="success.main">
            {reconciledCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 140px', minWidth: 140 }}>
          <Typography variant="body2" color="text.secondary">
            Posted
          </Typography>
          <Typography variant="h4" color="success.main">
            {transactions.filter((tx) => tx.accountingPosting).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 140px', minWidth: 140 }}>
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
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="RECONCILED">Reconciled</MenuItem>
              <MenuItem value="DISPUTED">Disputed</MenuItem>
              <MenuItem value="POSTED">Posted to QuickBooks</MenuItem>
              <MenuItem value="NOT_POSTED">Not yet posted</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
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

        {/* Bulk approval */}
        {pendingMatches.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={2}
            p={1.5}
            sx={{ bgcolor: 'action.hover', borderRadius: 1 }}
            flexWrap="wrap"
          >
            <Typography variant="body2">
              {selectedMatchIds.length > 0
                ? `${selectedMatchIds.length} selected`
                : `${pendingMatches.length} awaiting approval`}
            </Typography>
            <Button
              size="small"
              onClick={selectHighConfidence}
              disabled={highConfidenceCount === 0}
            >
              Select high confidence ({highConfidenceCount})
            </Button>
            {selectedMatchIds.length > 0 && (
              <Button size="small" onClick={() => setSelectedMatchIds([])}>
                Clear
              </Button>
            )}
            <Box flex={1} />
            <Button
              variant="contained"
              size="small"
              startIcon={<ApproveAllIcon />}
              onClick={handleBulkApprove}
              disabled={approving || selectedMatchIds.length === 0}
            >
              {approving
                ? 'Approving...'
                : `Approve ${selectedMatchIds.length || ''} selected`}
            </Button>
          </Box>
        )}

        {/* Transactions Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Date</TableCell>
                  <TableCell>Sender</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Match</TableCell>
                  <TableCell align="right">Confidence</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography color="text.secondary" py={4}>
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell padding="checkbox">
                        {tx.reconciliationMatch?.status === 'PENDING' && (
                          <Checkbox
                            size="small"
                            checked={selectedMatchIds.includes(
                              tx.reconciliationMatch.id,
                            )}
                            onChange={() =>
                              toggleMatchSelection(tx.reconciliationMatch!.id)
                            }
                            slotProps={{
                              input: {
                                'aria-label': `Select match for ${
                                  tx.senderName || 'transaction'
                                } ${tx.amount}`,
                              },
                            }}
                          />
                        )}
                      </TableCell>
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
                        {tx.reconciliationMatch?.confidenceScore != null ? (
                          <Chip
                            label={`${Math.round(
                              tx.reconciliationMatch.confidenceScore,
                            )}%`}
                            size="small"
                            color={
                              tx.reconciliationMatch.confidenceScore >=
                              HIGH_CONFIDENCE
                                ? 'success'
                                : 'default'
                            }
                            variant="outlined"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {tx.status === 'PENDING' &&
                          (!tx.reconciliationMatch ||
                            tx.reconciliationMatch.status === 'REJECTED') && (
                          <Tooltip title="Match to contact">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenMatchDialog(tx)}
                            >
                              <LinkIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {/*
                          A pending match is what awaits approval. This used to
                          also require tx.status === 'RECONCILED', which only
                          becomes true once a match is approved — so these
                          buttons could never appear and a matched transaction
                          was stuck on PENDING forever.
                        */}
                        {tx.reconciliationMatch?.status === 'PENDING' && (
                            <>
                              <Tooltip title="Approve match">
                                <IconButton
                                  size="small"
                                  color="success"
                                  disabled={resolvingId === tx.id}
                                  onClick={() => handleApproveMatch(tx.id)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject match">
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={resolvingId === tx.id}
                                  onClick={() => handleRejectMatch(tx.id)}
                                >
                                  <WarningIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        {tx.accountingPosting ? (
                          <Tooltip
                            title={
                              tx.accountingPosting.externalDocumentId
                                ? `QuickBooks ID ${tx.accountingPosting.externalDocumentId}`
                                : 'Already posted to QuickBooks'
                            }
                          >
                            <Chip
                              icon={<CheckCircleIcon />}
                              label={
                                tx.accountingPosting.externalDocumentNumber
                                  ? `Posted #${tx.accountingPosting.externalDocumentNumber}`
                                  : 'Posted'
                              }
                              size="small"
                              color="success"
                            />
                          </Tooltip>
                        ) : (
                          tx.reconciliationMatch?.status === 'APPROVED' && (
                            <QuickBooksPostingPanel
                              transactionId={tx.id}
                              onPosted={fetchTransactions}
                            />
                          )
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
        fullScreen={isPhone}
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
                        {suggestion.contact.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {suggestion.contact.phone}
                          </Typography>
                        )}
                        {(suggestion.contact.location ||
                          suggestion.contact.fob) && (
                          <Stack
                            direction="row"
                            alignItems="center"
                            gap={0.5}
                            mt={0.5}
                          >
                            <PlaceIcon
                              sx={{ fontSize: 14 }}
                              color={
                                suggestion.contact.attributionIsFallback
                                  ? 'warning'
                                  : 'action'
                              }
                            />
                            <Typography variant="caption" color="text.secondary">
                              {[
                                suggestion.contact.location,
                                suggestion.contact.fob,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                              {suggestion.contact.attributionIsFallback &&
                                ' (default)'}
                            </Typography>
                          </Stack>
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {suggestion.matchReasons.join(', ')}
                        </Typography>
                      </Box>
                      {/* The server sends a whole percentage already. */}
                      <Chip
                        label={`${Math.round(suggestion.confidenceScore)}%`}
                        color={
                          suggestion.confidenceScore >= 80
                            ? 'success'
                            : 'warning'
                        }
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
              // The server already applied the search, so MUI must not filter
              // the results again.
              filterOptions={(option) => option}
              getOptionLabel={(option) =>
                `${option.name}${option.phone ? ` (${option.phone})` : ''}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedContact}
              onChange={(_, value) => setSelectedContact(value)}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') setContactQuery(value);
              }}
              loading={loadingContacts}
              noOptionsText={
                contactQuery
                  ? 'No contact matches that'
                  : 'Start typing a name or phone number'
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search contact"
                  placeholder="Name or phone number"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingContacts && <CircularProgress size={16} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
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
