import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TablePagination,
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
  Alert,
  AlertTitle,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  ReceiptLong as ReceiptLongIcon,
  AutoFixHigh as AutoMatchIcon,
  DoneAll as DoneAllIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, getAsync, post, postAsync, put } from '../../utils/ajax';
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

/**
 * How many gifts go to QuickBooks in one request.
 *
 * QuickBooks is called once per receipt and the server posts them one at a
 * time, so a batch's duration grows with its size: sending a whole selection at
 * once ran past the HTTP timeout at around twenty-five gifts and the finance
 * user lost the result of the ones that had already gone across. A chunk keeps
 * every request short, and the run reports progress instead of going quiet.
 */
const POST_CHUNK_SIZE = 10;

/**
 * A chunk's own timeout, well above the app default.
 *
 * Ten receipts against a slow QuickBooks can legitimately take longer than an
 * ordinary request is allowed, and cutting one off mid-flight is worse than
 * waiting: the receipts it already wrote would be reported as failures.
 */
const POST_CHUNK_TIMEOUT_MS = 120000;

/**
 * How many transactions to load for reconciling.
 *
 * The endpoint pages at 100 unless asked otherwise, which silently hid the rest
 * of an imported statement. Reconciliation works on the whole batch — search,
 * the posted/not-posted filters and "select everything actionable" all run
 * across what has been loaded — so the screen fetches the set and pages it in
 * the browser. The ceiling keeps one bad filter from pulling years of history.
 */
const FETCH_LIMIT = 1000;

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
  const [contactSearchFailed, setContactSearchFailed] = useState(false);
  // Identifies the newest search so a slower earlier reply cannot overwrite it.
  const contactRequestRef = useRef(0);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const [saving, setSaving] = useState(false);

  // One selection drives both bulk actions. Transaction ids are kept because a
  // row's useful action depends on its match state: a pending match can be
  // approved, an approved one can be posted.
  const [selectedTxnIds, setSelectedTxnIds] = useState<number[]>([]);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkPosting, setBulkPosting] = useState(false);
  // How far a chunked run has got, so a long post is visibly working.
  const [postProgress, setPostProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  // Kept on screen rather than in a toast: a finance user needs to read the
  // names back and act on them, which a message that disappears prevents.
  const [postFailures, setPostFailures] = useState<PostFailure[]>([]);
  const [autoMatching, setAutoMatching] = useState(false);

  // Set when the fetch came back full, which means there is more history behind
  // it. Said out loud, because a silently truncated list is what hid the rest of
  // an imported statement in the first place.
  const [atFetchLimit, setAtFetchLimit] = useState(false);

  // Paging happens in the browser, over the loaded set.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchTransactions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('limit', FETCH_LIMIT.toString());
    if (isServerStatus(statusFilter)) params.append('status', statusFilter);
    if (accountFilter !== 'ALL') params.append('accountId', accountFilter.toString());

    get(
      `${remoteRoutes.financialTransactions}?${params.toString()}`,
      (data: Transaction[]) => {
        setTransactions(data);
        setAtFetchLimit(data.length >= FETCH_LIMIT);
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

  // Any change to what is being shown starts from the first screen; staying on
  // page 4 of a narrowed list shows nothing at all.
  useEffect(() => {
    setPage(0);
  }, [statusFilter, accountFilter, search]);

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
      const requestId = ++contactRequestRef.current;
      setContactSearchFailed(false);

      getAsync<ContactOption[]>(remoteRoutes.contacts, {
        ...(contactQuery.trim() ? { query: contactQuery.trim() } : {}),
        limit: 50,
      })
        .then((data) => {
          // Replies can arrive out of order; only the newest one counts.
          if (requestId !== contactRequestRef.current) return;
          setContacts(data ?? []);
        })
        .catch(() => {
          if (requestId !== contactRequestRef.current) return;
          // A failed search is not the same as finding nobody.
          setContactSearchFailed(true);
          setContacts([]);
        })
        .finally(() => {
          if (requestId !== contactRequestRef.current) return;
          setLoadingContacts(false);
        });
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

  /** Describes a gift the server never got to answer for, using what is on screen. */
  const failureFromRow = (
    transactionId: number,
    error: string,
  ): PostFailure => {
    const tx = transactions.find((t) => t.id === transactionId);
    return {
      transactionId,
      status: 'FAILED',
      giver: tx?.senderName ?? `Transaction ${transactionId}`,
      amount: tx?.amount ?? 0,
      transactionDate: tx?.transactionDate ?? '',
      error,
    };
  };

  const handleBulkPost = async () => {
    const ids = postableTxnIds;
    if (ids.length === 0) return;

    setBulkPosting(true);
    setPostFailures([]);
    setPostProgress({ done: 0, total: ids.length });

    const failures: PostFailure[] = [];
    let posted = 0;

    // One chunk at a time, never in parallel: QuickBooks rate-limits per
    // company, and gifts that arrive faster than it accepts them come back as
    // failures a finance user would have to chase by hand.
    for (let from = 0; from < ids.length; from += POST_CHUNK_SIZE) {
      const chunk = ids.slice(from, from + POST_CHUNK_SIZE);

      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await postAsync<BatchPostResult>(
          `${remoteRoutes.financialAccountingBatch}/post-batch`,
          { transactionIds: chunk },
          { timeout: POST_CHUNK_TIMEOUT_MS },
        );
        posted += result.posted;
        failures.push(...result.results.filter((r) => r.status === 'FAILED'));
      } catch (err) {
        // A chunk that never reached the server must not abandon the rest of
        // the run. Name its gifts and carry on with the next chunk.
        const message = errorMessage(err, 'Posting failed');
        failures.push(...chunk.map((id) => failureFromRow(id, message)));
      }

      setPostProgress({ done: Math.min(from + chunk.length, ids.length), total: ids.length });
    }

    // Every gift is attempted, so a failure here is about those specific ones —
    // the rest have already gone across.
    setPostFailures(failures);
    if (posted > 0) {
      toast.success(`Posted ${posted} to QuickBooks`);
    }
    if (failures.length > 0) {
      toast.warning(
        `${failures.length} could not be posted — see the list below`,
      );
    }

    setBulkPosting(false);
    setPostProgress(null);
    fetchTransactions();
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

  // Clamped rather than corrected in an effect: a list can shrink under the
  // current page at any time, and MUI warns when asked to render a page that no
  // longer exists.
  const pageCount = Math.max(
    1,
    Math.ceil(filteredTransactions.length / rowsPerPage),
  );
  const currentPage = Math.min(page, pageCount - 1);
  const visibleTransactions = filteredTransactions.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage,
  );

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
        <Stack direction="row" gap={1}>
          <Button
            startIcon={
              autoMatching ? <CircularProgress size={18} /> : <AutoMatchIcon />
            }
            variant="contained"
            onClick={handleRunAutoMatch}
            disabled={autoMatching}
          >
            {autoMatching ? 'Matching…' : 'Run auto-match'}
          </Button>
          <Button startIcon={<RefreshIcon />} onClick={fetchTransactions}>
            Refresh
          </Button>
        </Stack>
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

        {actionableIds.length > 0 && (
          <Alert
            severity={selectedTxnIds.length > 0 ? 'info' : 'success'}
            // The buttons live in the message rather than MUI's `action` slot:
            // that slot pins itself to the right and never wraps, so on a phone
            // the two buttons crushed the text. Here they simply drop below it.
            sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              gap={1.5}
            >
              <Box>
                {selectedTxnIds.length > 0
                  ? `${selectedTxnIds.length} selected — ${approvableMatchIds.length} to approve, ${postableTxnIds.length} ready to post.`
                  : `${actionableIds.length} transaction${
                      actionableIds.length === 1 ? '' : 's'
                    } need attention — tick the header box to select them all.`}
              </Box>
              <Stack direction="row" gap={1} flexShrink={0}>
                <Button
                  size="small"
                  variant="contained"
                  sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
                  startIcon={
                    bulkApproving ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DoneAllIcon />
                    )
                  }
                  onClick={handleBulkApprove}
                  disabled={approvableMatchIds.length === 0 || bulkApproving}
                >
                  Approve {approvableMatchIds.length || ''}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  sx={{ flex: { xs: 1, sm: 'none' }, whiteSpace: 'nowrap' }}
                  startIcon={
                    bulkPosting ? (
                      <CircularProgress size={16} />
                    ) : (
                      <ReceiptLongIcon />
                    )
                  }
                  onClick={handleBulkPost}
                  disabled={postableTxnIds.length === 0 || bulkPosting}
                >
                  {postProgress
                    ? `Posting ${postProgress.done}/${postProgress.total}`
                    : `Post ${postableTxnIds.length || ''}`}
                </Button>
              </Stack>
            </Stack>
          </Alert>
        )}

        {postFailures.length > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            onClose={() => setPostFailures([])}
          >
            <AlertTitle>
              {postFailures.length} could not be posted to QuickBooks
            </AlertTitle>
            <Typography variant="body2" mb={1}>
              Everything else in the batch went across. These need attention:
            </Typography>
            <Stack component="ul" gap={0.75} sx={{ m: 0, pl: 2.5 }}>
              {postFailures.map((failure) => (
                <Box component="li" key={failure.transactionId}>
                  <Typography variant="body2" component="span" fontWeight={600}>
                    {failure.giver}
                  </Typography>
                  {failure.amount > 0 && (
                    <Typography
                      variant="body2"
                      component="span"
                      color="text.secondary"
                    >
                      {' '}
                      · {failure.amount.toLocaleString()}
                      {failure.transactionDate
                        ? ` · ${failure.transactionDate}`
                        : ''}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block">
                    {failure.error}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Alert>
        )}

        {atFetchLimit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Showing the most recent {FETCH_LIMIT.toLocaleString()} transactions.
            Narrow by account or status to reach older ones.
          </Alert>
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
                  <TableCell padding="checkbox">
                    <Tooltip
                      title={
                        actionableIds.length === 0
                          ? 'Nothing to approve or post'
                          : allSelected
                            ? 'Clear selection'
                            : 'Select everything that can be approved or posted'
                      }
                    >
                      <span>
                        <Checkbox
                          size="small"
                          disabled={actionableIds.length === 0}
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={toggleAll}
                          inputProps={{ 'aria-label': 'Select all' }}
                        />
                      </span>
                    </Tooltip>
                  </TableCell>
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
                    <TableCell colSpan={9} align="center">
                      <Typography color="text.secondary" py={4}>
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleTransactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell padding="checkbox">
                        {!tx.accountingPosting &&
                          (tx.reconciliationMatch?.status === 'PENDING' ||
                            tx.reconciliationMatch?.status === 'APPROVED') && (
                          <Checkbox
                            size="small"
                            checked={selectedTxnIds.includes(tx.id)}
                            onChange={() => toggleOne(tx.id)}
                            inputProps={{
                              'aria-label': `Select ${
                                tx.senderName ?? 'transaction'
                              }`,
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

        {!loading && filteredTransactions.length > 0 && (
          <TablePagination
            component="div"
            count={filteredTransactions.length}
            page={currentPage}
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Rows"
          />
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
                contactSearchFailed
                  ? 'Could not search contacts — check your connection and try again'
                  : contactQuery
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
