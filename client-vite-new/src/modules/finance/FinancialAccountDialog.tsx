import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import { get, post, put } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { AccountType } from './types';
import type { FinancialAccount, FinancialAccountFormData } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAccount: FinancialAccount | null;
}

interface GroupOption {
  id: number;
  name: string;
}

const initialFormData: FinancialAccountFormData = {
  name: '',
  accountNumber: '',
  type: AccountType.BANK,
  ownerGroupId: null,
  bankName: '',
  provider: '',
  isActive: true,
};

const FinancialAccountDialog = ({ open, onClose, onSuccess, editAccount }: Props) => {
  const [formData, setFormData] = useState<FinancialAccountFormData>(initialFormData);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(true);

      // Fetch groups for dropdown
      get(
        `${remoteRoutes.groupsCombo}`,
        (data: GroupOption[]) => {
          setGroups(data);
          setLoading(false);
        },
        () => {
          setGroups([]);
          setLoading(false);
        }
      );

      if (editAccount) {
        setFormData({
          name: editAccount.name,
          accountNumber: editAccount.accountNumber,
          type: editAccount.type,
          ownerGroupId: editAccount.ownerGroupId || null,
          bankName: editAccount.metadata?.bankName || '',
          provider: editAccount.metadata?.provider || '',
          isActive: editAccount.isActive,
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [open, editAccount]);

  const handleChange = (field: keyof FinancialAccountFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }
    if (!formData.accountNumber.trim()) {
      setError('Account number is required');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      accountNumber: formData.accountNumber.trim(),
      type: formData.type,
      ownerGroupId: formData.ownerGroupId,
      metadata: {
        ...(formData.type === AccountType.BANK && formData.bankName
          ? { bankName: formData.bankName }
          : {}),
        ...(formData.type === AccountType.MOBILE_MONEY && formData.provider
          ? { provider: formData.provider }
          : {}),
      },
      isActive: formData.isActive,
    };

    if (editAccount) {
      put(
        `${remoteRoutes.financialAccounts}/${editAccount.id}`,
        payload,
        () => {
          toast.success('Account updated successfully');
          setSaving(false);
          onSuccess();
        },
        (err: any) => {
          setError(err?.message || 'Failed to update account');
          setSaving(false);
        }
      );
    } else {
      post(
        remoteRoutes.financialAccounts,
        payload,
        () => {
          toast.success('Account created successfully');
          setSaving(false);
          onSuccess();
        },
        (err: any) => {
          setError(err?.message || 'Failed to create account');
          setSaving(false);
        }
      );
    }
  };

  const isEdit = !!editAccount;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Account' : 'Add Account'}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              label="Account Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              required
              disabled={saving}
              placeholder="e.g., Main Offering Account"
            />

            <TextField
              label="Account Number"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              fullWidth
              required
              disabled={saving}
              placeholder="e.g., 1234567890"
            />

            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={formData.type}
                label="Account Type"
                onChange={(e) => handleChange('type', e.target.value)}
                disabled={saving}
              >
                <MenuItem value={AccountType.BANK}>Bank Account</MenuItem>
                <MenuItem value={AccountType.MOBILE_MONEY}>Mobile Money</MenuItem>
                <MenuItem value={AccountType.CASH}>Cash</MenuItem>
              </Select>
            </FormControl>

            {formData.type === AccountType.BANK && (
              <TextField
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                fullWidth
                disabled={saving}
                placeholder="e.g., Stanbic Bank"
              />
            )}

            {formData.type === AccountType.MOBILE_MONEY && (
              <TextField
                label="Provider"
                value={formData.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
                fullWidth
                disabled={saving}
                placeholder="e.g., MTN Mobile Money"
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Owner Group (Optional)</InputLabel>
              <Select
                value={formData.ownerGroupId ?? ''}
                label="Owner Group (Optional)"
                onChange={(e) => {
                  const val = e.target.value as string | number;
                  handleChange('ownerGroupId', val === '' ? null : Number(val));
                }}
                disabled={saving}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  disabled={saving}
                />
              }
              label="Active"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinancialAccountDialog;
