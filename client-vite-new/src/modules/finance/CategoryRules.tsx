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
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, post, put, del } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type {
  CategoryRule,
  TransactionCategory,
  FinancialAccount,
  CategoryRuleConditions,
} from './types';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface RuleFormData {
  name: string;
  category: TransactionCategory;
  conditions: CategoryRuleConditions;
  priority: number;
  isActive: boolean;
}

const initialFormData: RuleFormData = {
  name: '',
  category: 'OFFERING' as TransactionCategory,
  conditions: {},
  priority: 0,
  isActive: true,
};

const CategoryRules = () => {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<CategoryRule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  const fetchRules = () => {
    setLoading(true);
    get(
      remoteRoutes.financialCategoryRules,
      (data: CategoryRule[]) => {
        setRules(data.sort((a, b) => a.priority - b.priority));
        setLoading(false);
      },
      () => {
        toast.error('Failed to load category rules');
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
    fetchRules();
    fetchAccounts();
  }, []);

  const handleOpenDialog = (rule?: CategoryRule) => {
    if (rule) {
      setEditRule(rule);
      setFormData({
        name: rule.name,
        category: rule.category,
        conditions: rule.conditions,
        priority: rule.priority,
        isActive: rule.isActive,
      });
    } else {
      setEditRule(null);
      setFormData({
        ...initialFormData,
        priority: rules.length > 0 ? Math.max(...rules.map((r) => r.priority)) + 1 : 1,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditRule(null);
    setFormData(initialFormData);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }

    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      conditions: formData.conditions,
      priority: formData.priority,
      isActive: formData.isActive,
    };

    if (editRule) {
      put(
        `${remoteRoutes.financialCategoryRules}/${editRule.id}`,
        payload,
        () => {
          toast.success('Rule updated');
          setSaving(false);
          handleCloseDialog();
          fetchRules();
        },
        (err: any) => {
          toast.error(err?.message || 'Failed to update rule');
          setSaving(false);
        }
      );
    } else {
      post(
        remoteRoutes.financialCategoryRules,
        payload,
        () => {
          toast.success('Rule created');
          setSaving(false);
          handleCloseDialog();
          fetchRules();
        },
        (err: any) => {
          toast.error(err?.message || 'Failed to create rule');
          setSaving(false);
        }
      );
    }
  };

  const handleDelete = (rule: CategoryRule) => {
    if (!window.confirm(`Delete rule "${rule.name}"?`)) return;

    del(
      `${remoteRoutes.financialCategoryRules}/${rule.id}`,
      () => {
        toast.success('Rule deleted');
        fetchRules();
      },
      () => {
        toast.error('Failed to delete rule');
      }
    );
  };

  const handleToggleActive = (rule: CategoryRule) => {
    put(
      `${remoteRoutes.financialCategoryRules}/${rule.id}`,
      { ...rule, isActive: !rule.isActive },
      () => {
        toast.success(`Rule ${rule.isActive ? 'disabled' : 'enabled'}`);
        fetchRules();
      },
      () => {
        toast.error('Failed to update rule');
      }
    );
  };

  const updateConditions = (key: keyof CategoryRuleConditions, value: any) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [key]: value === '' || (Array.isArray(value) && value.length === 0) ? undefined : value,
      },
    }));
  };

  const formatConditions = (conditions: CategoryRuleConditions): string => {
    const parts: string[] = [];
    if (conditions.accounts?.length) {
      const accountNames = conditions.accounts
        .map((id) => accounts.find((a) => a.id === id)?.name || `#${id}`)
        .join(', ');
      parts.push(`Accounts: ${accountNames}`);
    }
    if (conditions.keywords?.length) {
      parts.push(`Keywords: ${conditions.keywords.join(', ')}`);
    }
    if (conditions.daysOfWeek?.length) {
      const days = conditions.daysOfWeek
        .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
        .join(', ');
      parts.push(`Days: ${days}`);
    }
    if (conditions.timeRange) {
      parts.push(`Time: ${conditions.timeRange.start} - ${conditions.timeRange.end}`);
    }
    if (conditions.dateRange) {
      parts.push(`Date: ${conditions.dateRange.start} - ${conditions.dateRange.end}`);
    }
    return parts.length > 0 ? parts.join(' | ') : 'No conditions';
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
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Category Rules</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Rule
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Category rules automatically classify imported transactions based on conditions like
        account, keywords, time of day, or day of week. Rules are evaluated in priority order.
      </Alert>

      {/* Rules Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}>Order</TableCell>
              <TableCell>Rule Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Conditions</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" py={4}>
                    No category rules configured. Create one to auto-classify transactions.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id} hover sx={{ opacity: rule.isActive ? 1 : 0.5 }}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <DragIndicatorIcon
                        fontSize="small"
                        sx={{ color: 'text.disabled', mr: 1 }}
                      />
                      {rule.priority}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{rule.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={rule.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatConditions(rule.conditions)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.isActive ? 'Active' : 'Disabled'}
                      color={rule.isActive ? 'success' : 'default'}
                      size="small"
                      variant={rule.isActive ? 'filled' : 'outlined'}
                      onClick={() => handleToggleActive(rule)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(rule)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(rule)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editRule ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <TextField
              label="Rule Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., Sunday Morning Offering"
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as TransactionCategory,
                  }))
                }
              >
                <MenuItem value="TITHE">Tithe</MenuItem>
                <MenuItem value="OFFERING">Offering</MenuItem>
                <MenuItem value="DONATION">Donation</MenuItem>
                <MenuItem value="ARISE_BUILD">Arise & Build</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 0 }))
              }
              fullWidth
              helperText="Lower numbers are evaluated first"
            />

            <Typography variant="subtitle2" color="text.secondary">
              Conditions (leave empty to skip)
            </Typography>

            <Autocomplete
              multiple
              options={accounts}
              getOptionLabel={(option) => option.name}
              value={accounts.filter((a) => formData.conditions.accounts?.includes(a.id))}
              onChange={(_, value) =>
                updateConditions(
                  'accounts',
                  value.map((v) => v.id)
                )
              }
              renderInput={(params) => (
                <TextField {...params} label="Accounts" placeholder="Select accounts" />
              )}
            />

            <TextField
              label="Keywords"
              value={formData.conditions.keywords?.join(', ') || ''}
              onChange={(e) =>
                updateConditions(
                  'keywords',
                  e.target.value
                    .split(',')
                    .map((k) => k.trim())
                    .filter((k) => k)
                )
              }
              fullWidth
              placeholder="tithe, offering (comma-separated)"
              helperText="Match if narration contains any of these keywords"
            />

            <Autocomplete
              multiple
              options={DAYS_OF_WEEK}
              getOptionLabel={(option) => option.label}
              value={DAYS_OF_WEEK.filter((d) =>
                formData.conditions.daysOfWeek?.includes(d.value)
              )}
              onChange={(_, value) =>
                updateConditions(
                  'daysOfWeek',
                  value.map((v) => v.value)
                )
              }
              renderInput={(params) => (
                <TextField {...params} label="Days of Week" placeholder="Select days" />
              )}
            />

            <Box display="flex" gap={2}>
              <TextField
                label="Time Start (HH:MM)"
                value={formData.conditions.timeRange?.start || ''}
                onChange={(e) =>
                  updateConditions('timeRange', {
                    ...formData.conditions.timeRange,
                    start: e.target.value,
                  })
                }
                placeholder="08:00"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Time End (HH:MM)"
                value={formData.conditions.timeRange?.end || ''}
                onChange={(e) =>
                  updateConditions('timeRange', {
                    ...formData.conditions.timeRange,
                    end: e.target.value,
                  })
                }
                placeholder="12:00"
                sx={{ flex: 1 }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : editRule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryRules;
