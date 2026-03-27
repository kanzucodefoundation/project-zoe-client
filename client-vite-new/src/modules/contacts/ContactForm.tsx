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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  extractErrorMessageFromData,
  get,
  handleError,
  patch,
  post,
} from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date | null;
  gender?: string;
  civilStatus?: string;
  placeOfWork?: string;
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
type GroupOption = { id: number; name: string };

const ContactForm = ({
  contactId,
  onSave,
  onCancel,
  onError,
}: ContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    civilStatus: '',
    placeOfWork: '',
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

  // Flatten hierarchical groups into simple id/name array
  const flattenGroups = (nodes: GroupNode[] | undefined): GroupOption[] => {
    const out: GroupOption[] = [];
    const stack: GroupNode[] = [...(nodes || [])];
    while (stack.length) {
      const n = stack.pop() as GroupNode;
      out.push({ id: n.id, name: n.name });
      if (n.children && n.children.length) {
        for (let i = 0; i < n.children.length; i++) stack.push(n.children[i]);
      }
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  };

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
            dateOfBirth: person.dateOfBirth
              ? new Date(person.dateOfBirth)
              : null,
            gender: person.gender || '',
            civilStatus: person.civilStatus || '',
            placeOfWork: person.placeOfWork || '',
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

    const submitData = {
      category: 'Person',
      person: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender || undefined,
        civilStatus: formData.civilStatus || undefined,
        placeOfWork: formData.placeOfWork || undefined,
        dateOfBirth:
          formData.dateOfBirth?.toISOString()?.split('T')[0] || undefined,
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
        : 'Failed to update contact. Please try again.';

      onError?.(errorMessage);
      handleError(error, response);
    };

    const apiCall = contactId
      ? patch(
          `${remoteRoutes.contacts}/${contactId}`,
          submitData,
          onSave || (() => {}),
          handleSubmitError,
        )
      : post(
          remoteRoutes.contacts,
          submitData,
          onSave || (() => {}),
          handleSubmitError,
        );

    apiCall.finally(() => setSubmitting(false));
  };

  if (loading) {
    return <Typography>Loading contact...</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(date) => handleChange('dateOfBirth', date)}
              openTo="year"
              views={['year', 'month', 'day']}
              minDate={new Date(new Date().getFullYear() - 100, 0, 1)}
              maxDate={
                new Date(new Date().getFullYear() - 5, new Date().getMonth(), 1)
              }
              slotProps={{ textField: { fullWidth: true } }}
            />
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
                <MenuItem value="Other">Other</MenuItem>
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
                getOptionLabel={(option) => option.name}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Groups"
                    placeholder="Type to search groups"
                  />
                )}
                // To show ID in option list
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.name}
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
            <TextField
              label="Country"
              fullWidth
              value={formData.address?.country}
              onChange={(e) =>
                handleNestedChange('address', 'country', e.target.value)
              }
            />
          </Grid>
        </Grid>

        {/* Actions */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !formData.firstName || !formData.lastName}
          >
            {submitting
              ? 'Saving...'
              : contactId
              ? 'Update Contact'
              : 'Create Contact'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ContactForm;
