import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Autocomplete,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { toast } from 'react-toastify';
import { COUNTRIES } from '../../data/countries';
import {
  extractErrorMessageFromData,
  get,
  handleError,
  patch,
  post,
} from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import {
  ContactStatus,
  CONTACT_STATUS_LABELS,
} from '../../utils/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dobMonth: number | '';
  dobDay: number | '';
  gender?: string;
  civilStatus?: string;
  placeOfWork?: string;
  status?: ContactStatus;
  address?: {
    country?: string;
    district?: string;
    freeForm?: string;
  };
}

interface ContactFormProps {
  contactId?: string;
  onSave?: () => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
}

// Group types local to this component
type GroupNode = {
  id: number;
  name: string;
  children?: GroupNode[];
};
type GroupOption = { id: number; name: string; parentName?: string };

const ContactForm = ({
  contactId,
  onSave,
  onCancel,
  onError,
}: ContactFormProps) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dobMonth: '',
    dobDay: '',
    gender: '',
    civilStatus: '',
    placeOfWork: '',
    status: ContactStatus.Active,
    address: {
      country: '',
      district: '',
      freeForm: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Groups state
  const [groupsOptions, setGroupsOptions] = useState<GroupOption[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  // Flatten hierarchical groups, preserving parent name for display
  const flattenGroups = (nodes: GroupNode[] | undefined, parentName?: string): GroupOption[] => {
    const out: GroupOption[] = [];
    for (const n of (nodes || [])) {
      out.push({ id: n.id, name: n.name, parentName });
      if (n.children?.length) {
        out.push(...flattenGroups(n.children, n.name));
      }
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  };

  const getGroupLabel = (option: GroupOption) =>
    option.parentName ? `${option.name} - ${option.parentName}` : option.name;

  // Fetch groups once
  useEffect(() => {
    get(
      remoteRoutes.groups,
      (data: any) => {
        const roots: GroupNode[] = Array.isArray(data) ? data : [data];
        setGroupsOptions(flattenGroups(roots));
      },
      () => {
        setGroupsOptions([]);
      },
    );
  }, []);

  // Load contact for edit
  useEffect(() => {
    if (contactId) {
      setLoading(true);
      get(
        `${remoteRoutes.contacts}/${contactId}`,
        (response) => {
          const person = response.person || {};
          const primaryEmail =
            response.emails?.find((e: any) => e.isPrimary) ||
            response.emails?.[0];
          const primaryPhone =
            response.phones?.find((p: any) => p.isPrimary) ||
            response.phones?.[0];
          const primaryAddress =
            response.addresses?.find((a: any) => a.isPrimary) ||
            response.addresses?.[0];

          setFormData({
            firstName: person.firstName || '',
            lastName: person.lastName || '',
            email: primaryEmail?.value || '',
            phone: primaryPhone?.value || '',
            // Parse day/month directly from the ISO string to avoid timezone shifts.
            // Year is ignored — we use 1900 as a sentinel for "year unknown".
            dobMonth: person.dateOfBirth
              ? parseInt(person.dateOfBirth.split('T')[0].split('-')[1], 10) || ''
              : '',
            dobDay: person.dateOfBirth
              ? parseInt(person.dateOfBirth.split('T')[0].split('-')[2], 10) || ''
              : '',
            gender: person.gender || '',
            civilStatus: person.civilStatus || '',
            placeOfWork: person.placeOfWork || '',
            status:
              (response.status as ContactStatus) || ContactStatus.Active,
            address: {
              country: primaryAddress?.country || '',
              district: primaryAddress?.district || '',
              freeForm: primaryAddress?.freeForm || '',
            },
          });

          // Try to preselect groups if present on the response
          const groupsFromContact: number[] =
            response.groups?.map((g: any) => g.id) ??
            response.groupMemberships?.map((m: any) => m.groupId) ??
            [];
          setSelectedGroupIds(groupsFromContact);

          setLoading(false);
        },
        () => setLoading(false),
      );
    }
  }, [contactId]);

  const handleChange = (field: keyof ContactFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (
    parent: keyof ContactFormData,
    field: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onError?.('');

    const isEditing = Boolean(contactId);
    const successMessage = isEditing
      ? 'Contact updated successfully'
      : 'Contact created successfully';
    const fallbackErrorMessage = isEditing
      ? 'Failed to update contact. Please try again.'
      : 'Failed to create contact. Please try again.';

    const submitData = {
      category: 'Person',
      person: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender || undefined,
        civilStatus: formData.civilStatus || undefined,
        placeOfWork: formData.placeOfWork || undefined,
        // Store as 1900-MM-DD when year is unknown (1900 is the sentinel).
        dateOfBirth:
          formData.dobMonth !== '' && formData.dobDay !== ''
            ? `1900-${String(formData.dobMonth).padStart(2, '0')}-${String(formData.dobDay).padStart(2, '0')}`
            : undefined,
      },
      emails: formData.email
        ? [{ category: 'Personal', value: formData.email, isPrimary: true }]
        : [],
      phones: formData.phone
        ? [{ category: 'Mobile', value: formData.phone, isPrimary: true }]
        : [],
      addresses:
        formData.address?.country ||
        formData.address?.district ||
        formData.address?.freeForm
          ? [{ category: 'Home', isPrimary: true, ...formData.address }]
          : [],
      status: formData.status,
      // Now groups is an array of numbers like [12, 13]
      groups: selectedGroupIds.map((id) => ({ id })),
    };

    const handleSubmitError = (error: any, response?: any) => {
      const responseData = error?.response?.data || response?.data;
      const backendMessage = extractErrorMessageFromData(responseData);
      const errorMessage = backendMessage
        ? backendMessage
        : error?.message && !String(error.message).includes('status code')
        ? error.message
        : fallbackErrorMessage;

      onError?.(errorMessage);
      handleError(error, response);
    };

    const handleSubmitSuccess = () => {
      toast.success(successMessage);
      onSave?.();
    };

    const apiCall = contactId
      ? patch(
          `${remoteRoutes.contacts}/${contactId}`,
          submitData,
          handleSubmitSuccess,
          handleSubmitError,
        )
      : post(
          remoteRoutes.contacts,
          submitData,
          handleSubmitSuccess,
          handleSubmitError,
        );

    apiCall.finally(() => setSubmitting(false));
  };

  if (loading) {
    return <Typography>Loading contact...</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              required
              fullWidth
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              required
              fullWidth
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5, pl: 0.25 }}
            >
              Date of Birth
            </Typography>
            <Box display="flex" gap={1}>
              <FormControl sx={{ flex: 2 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={formData.dobMonth}
                  onChange={(e) => handleChange('dobMonth', e.target.value)}
                  label="Month"
                >
                  <MenuItem value=""><em>Month</em></MenuItem>
                  {MONTHS.map((m, i) => (
                    <MenuItem key={m} value={i + 1}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Day</InputLabel>
                <Select
                  value={formData.dobDay}
                  onChange={(e) => handleChange('dobDay', e.target.value)}
                  label="Day"
                >
                  <MenuItem value=""><em>Day</em></MenuItem>
                  {DAYS.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                label="Gender"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Additional Information */}
        <Typography variant="h6" gutterBottom>
          Additional Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Marital Status</InputLabel>
              <Select
                value={formData.civilStatus}
                onChange={(e) => handleChange('civilStatus', e.target.value)}
                label="Marital Status"
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widowed">Widowed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Place of Work"
              fullWidth
              value={formData.placeOfWork}
              onChange={(e) => handleChange('placeOfWork', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status ?? ContactStatus.Active}
                onChange={(e) =>
                  handleChange('status', e.target.value as ContactStatus)
                }
                label="Status"
              >
                {(Object.values(ContactStatus) as ContactStatus[]).map((s) => (
                  <MenuItem key={s} value={s}>
                    {CONTACT_STATUS_LABELS[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Groups dropdown */}
          <Grid size={{ xs: 12, sm: 12 }}>
            <FormControl fullWidth>
              <Autocomplete
                multiple
                options={groupsOptions}
                // value needs the full option objects; derive from selectedGroupIds
                value={groupsOptions.filter((g) =>
                  selectedGroupIds.includes(g.id),
                )}
                onChange={(_, newValue) => {
                  setSelectedGroupIds(newValue.map((g) => g.id));
                }}
                getOptionLabel={getGroupLabel}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Groups"
                    placeholder="Type to search groups"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {getGroupLabel(option)}
                  </li>
                )}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
              />
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Address Information */}
        <Typography variant="h6" gutterBottom>
          Address
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={12}>
            <TextField
              label="Address"
              fullWidth
              value={formData.address?.freeForm}
              onChange={(e) =>
                handleNestedChange('address', 'freeForm', e.target.value)
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="District"
              fullWidth
              value={formData.address?.district}
              onChange={(e) =>
                handleNestedChange('address', 'district', e.target.value)
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={COUNTRIES}
              value={formData.address?.country || null}
              onChange={(_, value) =>
                handleNestedChange('address', 'country', value ?? '')
              }
              renderInput={(params) => (
                <TextField {...params} label="Country" fullWidth />
              )}
            />
          </Grid>
        </Grid>

        {/* Actions */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column-reverse', sm: 'row' }}
          gap={1}
          justifyContent="flex-end"
          sx={{ pb: { xs: 'env(safe-area-inset-bottom)', sm: 0 } }}
        >
          <Button onClick={onCancel} fullWidth={isPhone}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !formData.firstName || !formData.lastName}
            fullWidth={isPhone}
          >
            {submitting
              ? 'Saving...'
              : contactId
              ? 'Update Contact'
              : 'Create Contact'}
          </Button>
        </Box>
      </Box>
  );
};

export default ContactForm;
