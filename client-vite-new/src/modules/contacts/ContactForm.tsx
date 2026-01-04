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
  maritalStatus?: string;
  occupation?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  cellGroupId?: string;
  locationId?: string;
  notes?: string;
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
    maritalStatus: '',
    occupation: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    cellGroupId: '',
    locationId: '',
    notes: '',
  });

  const [groups, setGroups] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load groups and locations
    get(remoteRoutes.groupsCombo, (response) => setGroups(response || []));
    get(`${remoteRoutes.authServer}/api/locations`, (response) => setLocations(response || []));

    // Load existing contact data if editing
    if (contactId) {
      setLoading(true);
      get(
        `${remoteRoutes.contacts}/${contactId}`,
        (response) => {
          setFormData({
            firstName: response.firstName || '',
            lastName: response.lastName || '',
            email: response.email || '',
            phone: response.phone || '',
            dateOfBirth: response.dateOfBirth ? new Date(response.dateOfBirth) : null,
            gender: response.gender || '',
            maritalStatus: response.maritalStatus || '',
            occupation: response.occupation || '',
            address: response.address || {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: '',
            },
            emergencyContact: response.emergencyContact || {
              name: '',
              phone: '',
              relationship: '',
            },
            cellGroupId: response.cellGroup?.id || '',
            locationId: response.location?.id || '',
            notes: response.notes || '',
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
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      dateOfBirth: formData.dateOfBirth?.toISOString(),
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
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              required
              fullWidth
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              required
              fullWidth
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(date) => handleChange('dateOfBirth', date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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

        {/* Church Information */}
        <Typography variant="h6" gutterBottom>
          Church Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Cell Group</InputLabel>
              <Select
                value={formData.cellGroupId}
                onChange={(e) => handleChange('cellGroupId', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.locationId}
                onChange={(e) => handleChange('locationId', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Marital Status</InputLabel>
              <Select
                value={formData.maritalStatus}
                onChange={(e) => handleChange('maritalStatus', e.target.value)}
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widowed">Widowed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Occupation"
              fullWidth
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Address Information */}
        <Typography variant="h6" gutterBottom>
          Address
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              label="Street Address"
              fullWidth
              value={formData.address?.street}
              onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              fullWidth
              value={formData.address?.city}
              onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="State/Province"
              fullWidth
              value={formData.address?.state}
              onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Postal Code"
              fullWidth
              value={formData.address?.postalCode}
              onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Country"
              fullWidth
              value={formData.address?.country}
              onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Emergency Contact */}
        <Typography variant="h6" gutterBottom>
          Emergency Contact
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
              fullWidth
              value={formData.emergencyContact?.name}
              onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone"
              fullWidth
              value={formData.emergencyContact?.phone}
              onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Relationship"
              fullWidth
              value={formData.emergencyContact?.relationship}
              onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Notes */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
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