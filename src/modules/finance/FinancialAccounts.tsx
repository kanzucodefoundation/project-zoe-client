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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, put } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type { FinancialAccount, AccountType } from './types';
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
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<FinancialAccount | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAccount, setMenuAccount] = useState<FinancialAccount | null>(null);

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

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Financial Accounts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Account
        </Button>
      </Box>

      {/* Search */}
      <Box mb={3}>
        <TextField
          placeholder="Search accounts..."
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
      </Box>

      {/* Accounts Table */}
      <TableContainer component={Paper}>
        <Table>
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
