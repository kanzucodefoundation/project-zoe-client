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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { get, post, put } from '../../utils/ajax';
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
}

const ContactForm = ({ contactId, onSave, onCancel }: ContactFormProps) => {
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

  useEffect(() => {
    if (contactId) {
      setLoading(true);
      get(
        `${remoteRoutes.contacts}/${contactId}`,
        (response) => {
          const person = response.person || {};
          const primaryEmail = response.emails?.find((e: any) => e.isPrimary) || response.emails?.[0];
          const primaryPhone = response.phones?.find((p: any) => p.isPrimary) || response.phones?.[0];
          const primaryAddress = response.addresses?.find((a: any) => a.isPrimary) || response.addresses?.[0];

          setFormData({
            firstName: person.firstName || '',
            lastName: person.lastName || '',
            email: primaryEmail?.value || '',
            phone: primaryPhone?.value || '',
            dateOfBirth: person.dateOfBirth ? new Date(person.dateOfBirth) : null,
            gender: person.gender || '',
            civilStatus: person.civilStatus || '',
            placeOfWork: person.placeOfWork || '',
            address: {
              country: primaryAddress?.country || '',
              district: primaryAddress?.district || '',
              freeForm: primaryAddress?.freeForm || '',
            },
          });
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
  }, [contactId]);

  const handleChange = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof ContactFormData, field: string, value: any) => {
    setFormData(prev => ({
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

    const submitData = {
      category: 'Person',
      person: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender || undefined,
        civilStatus: formData.civilStatus || undefined,
        placeOfWork: formData.placeOfWork || undefined,
        dateOfBirth: formData.dateOfBirth?.toISOString()?.split('T')[0] || undefined,
      },
      emails: formData.email
        ? [{ category: 'Personal', value: formData.email, isPrimary: true }]
        : [],
      phones: formData.phone
        ? [{ category: 'Mobile', value: formData.phone, isPrimary: true }]
        : [],
      addresses: (formData.address?.country || formData.address?.district || formData.address?.freeForm)
        ? [{ category: 'Home', isPrimary: true, ...formData.address }]
        : [],
    };

    const apiCall = contactId
      ? put(`${remoteRoutes.contacts}/${contactId}`, submitData, onSave || (() => {}))
      : post(remoteRoutes.contacts, submitData, onSave || (() => {}));

    apiCall
      ?.catch(() => {
        // Error handling is done in ajax utils
      })
      .finally(() => setSubmitting(false));
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
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
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
              onChange={(e) => handleNestedChange('address', 'freeForm', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="District"
              fullWidth
              value={formData.address?.district}
              onChange={(e) => handleNestedChange('address', 'district', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Country"
              fullWidth
              value={formData.address?.country}
              onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Actions */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !formData.firstName || !formData.lastName}
          >
            {submitting ? 'Saving...' : contactId ? 'Update Contact' : 'Create Contact'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ContactForm;