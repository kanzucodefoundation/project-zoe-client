import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Stack,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  CloudSync as CloudSyncIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, post, put } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type { FinancialAccount, AccountType, QboAccountOption } from './types';
import FinancialAccountDialog from './FinancialAccountDialog';

const getAccountTypeColor = (type: AccountType): 'primary' | 'secondary' | 'success' => {
  switch (type) {
    case 'BANK':
      return 'primary';
    case 'MOBILE_MONEY':
      return 'secondary';
    case 'CASH':
      return 'success';
    default:
      return 'primary';
  }
};

const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case 'BANK':
      return 'Bank';
    case 'MOBILE_MONEY':
      return 'Mobile Money';
    case 'CASH':
      return 'Cash';
    default:
      return type;
  }
};

const FinancialAccounts = () => {
  const theme = useTheme();
  // Dialogs fill the screen on a phone, as they do elsewhere in the app.
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<FinancialAccount | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAccount, setMenuAccount] = useState<FinancialAccount | null>(null);

  // "Add from QuickBooks" picker. Creating an account this way records the
  // Zoe -> QuickBooks mapping at the same time, so giving posted against it
  // never has to be told which QuickBooks account it belongs to.
  const [qboDialogOpen, setQboDialogOpen] = useState(false);
  const [qboAccounts, setQboAccounts] = useState<QboAccountOption[]>([]);
  const [qboLoading, setQboLoading] = useState(false);
  const [qboError, setQboError] = useState<string | null>(null);
  const [selectedQbo, setSelectedQbo] = useState<QboAccountOption | null>(null);
  const [qboAccountType, setQboAccountType] = useState<AccountType>(
    'MOBILE_MONEY' as AccountType,
  );
  const [linking, setLinking] = useState(false);

  const fetchAccounts = () => {
    setLoading(true);
    get(
      remoteRoutes.financialAccounts,
      (data: FinancialAccount[]) => {
        setAccounts(data);
        setLoading(false);
      },
      (error: any) => {
        console.error('Failed to fetch accounts:', error);
        toast.error('Failed to load financial accounts');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, account: FinancialAccount) => {
    setAnchorEl(event.currentTarget);
    setMenuAccount(account);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuAccount(null);
  };

  const handleEdit = () => {
    if (menuAccount) {
      setEditAccount(menuAccount);
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleToggleActive = () => {
    if (!menuAccount) return;

    const updatedAccount = { ...menuAccount, isActive: !menuAccount.isActive };
    put(
      `${remoteRoutes.financialAccounts}/${menuAccount.id}`,
      updatedAccount,
      () => {
        toast.success(`Account ${updatedAccount.isActive ? 'activated' : 'deactivated'}`);
        fetchAccounts();
      },
      (error: any) => {
        console.error('Failed to update account:', error);
        toast.error('Failed to update account');
      }
    );
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditAccount(null);
  };

  const handleDialogSuccess = () => {
    fetchAccounts();
    handleDialogClose();
  };

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(search.toLowerCase()) ||
    account.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    (account.ownerGroup?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const handleOpenQboDialog = () => {
    setQboDialogOpen(true);
    setSelectedQbo(null);
    setQboError(null);
    setQboLoading(true);
    get(
      `${remoteRoutes.financialAccounts}/quickbooks`,
      (data: QboAccountOption[]) => {
        setQboAccounts(data);
        setQboLoading(false);
      },
      () => {
        setQboError(
          'Could not load the QuickBooks chart of accounts. Check the QuickBooks connection under Integrations.',
        );
        setQboLoading(false);
      },
    );
  };

  const handleLinkQboAccount = () => {
    if (!selectedQbo) return;
    setLinking(true);
    post(
      `${remoteRoutes.financialAccounts}/quickbooks`,
      { qboAccountId: selectedQbo.id, accountType: qboAccountType },
      () => {
        toast.success(`Added "${selectedQbo.name}" from QuickBooks`);
        setLinking(false);
        setQboDialogOpen(false);
        fetchAccounts();
      },
      (err: unknown) => {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : 'Could not add the account',
        );
        setLinking(false);
      },
    );
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Typography variant="h4">Financial Accounts</Typography>
        <Stack direction="row" gap={1}>
          <Button
            variant="contained"
            startIcon={<CloudSyncIcon />}
            onClick={handleOpenQboDialog}
          >
            Add from QuickBooks
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add manually
          </Button>
        </Stack>
      </Box>

      {/* Search */}
      <Box mb={3}>
        <TextField
          placeholder="Search accounts..."
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
      </Box>

      {/* Accounts Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Account Name</TableCell>
              <TableCell>Account Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Owner Group</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" py={4}>
                    {search ? 'No accounts match your search' : 'No financial accounts yet'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{account.name}</Typography>
                  </TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={getAccountTypeLabel(account.type)}
                      color={getAccountTypeColor(account.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{account.ownerGroup?.name || '-'}</TableCell>
                  <TableCell>
                    {account.type === 'BANK' && account.metadata?.bankName && (
                      <Typography variant="body2" color="text.secondary">
                        {account.metadata.bankName}
                      </Typography>
                    )}
                    {account.type === 'MOBILE_MONEY' && account.metadata?.provider && (
                      <Typography variant="body2" color="text.secondary">
                        {account.metadata.provider}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.isActive ? 'Active' : 'Inactive'}
                      color={account.isActive ? 'success' : 'default'}
                      size="small"
                      variant={account.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, account)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleToggleActive}>
          {menuAccount?.isActive ? (
            <>
              <ToggleOffIcon fontSize="small" sx={{ mr: 1 }} />
              Deactivate
            </>
          ) : (
            <>
              <ToggleOnIcon fontSize="small" sx={{ mr: 1 }} />
              Activate
            </>
          )}
        </MenuItem>
      </Menu>

      {/* Add from QuickBooks */}
      <Dialog
        open={qboDialogOpen}
        onClose={() => setQboDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isPhone}
      >
        <DialogTitle>Add an account from QuickBooks</DialogTitle>
        <DialogContent dividers>
          {qboLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : qboError ? (
            <Alert severity="error">{qboError}</Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Pick the QuickBooks account this money lands in. Zoe links the
                two, so giving posted here always reaches the right account.
              </Typography>

              <List dense sx={{ maxHeight: 280, overflow: 'auto', mb: 2 }}>
                {qboAccounts.map((option) => {
                  const alreadyLinked = option.linkedAccountId !== null;
                  return (
                    <Tooltip
                      key={option.id}
                      title={
                        alreadyLinked
                          ? `Already linked to "${option.linkedAccountName}"`
                          : ''
                      }
                    >
                      <span>
                        <ListItemButton
                          selected={selectedQbo?.id === option.id}
                          disabled={alreadyLinked}
                          onClick={() => setSelectedQbo(option)}
                        >
                          <ListItemText
                            primary={option.name}
                            secondary={[option.accountType, option.currency]
                              .filter(Boolean)
                              .join(' · ')}
                          />
                          {alreadyLinked && (
                            <CheckCircleIcon fontSize="small" color="success" />
                          )}
                        </ListItemButton>
                      </span>
                    </Tooltip>
                  );
                })}
                {qboAccounts.length === 0 && (
                  <Typography variant="body2" color="text.secondary" py={2}>
                    No active accounts found in QuickBooks.
                  </Typography>
                )}
              </List>

              <FormControl fullWidth size="small">
                <InputLabel>How money reaches this account</InputLabel>
                <Select
                  value={qboAccountType}
                  label="How money reaches this account"
                  onChange={(e) =>
                    setQboAccountType(e.target.value as AccountType)
                  }
                >
                  <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
                  <MenuItem value="BANK">Bank</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQboDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLinkQboAccount}
            disabled={!selectedQbo || linking}
            startIcon={linking ? <CircularProgress size={18} /> : null}
          >
            {linking ? 'Adding…' : 'Add account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <FinancialAccountDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        editAccount={editAccount}
      />
    </Container>
  );
};

export default FinancialAccounts;
