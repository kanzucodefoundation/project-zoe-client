import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { get } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import ContactForm from './ContactForm';

interface ContactData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  civilStatus?: string;
  placeOfWork?: string;
  ageGroup?: string;
  address?: string;
  groupMemberships?: Array<{ group?: { id: number; name: string } }>;
}

function mapApiResponse(response: any): ContactData {
  const person = response.person || {};
  const primaryEmail = response.emails?.find((e: any) => e.isPrimary) || response.emails?.[0];
  const primaryPhone = response.phones?.find((p: any) => p.isPrimary) || response.phones?.[0];
  const primaryAddress = response.addresses?.find((a: any) => a.isPrimary) || response.addresses?.[0];

  const addressParts = [
    primaryAddress?.freeForm,
    primaryAddress?.district,
    primaryAddress?.country,
  ].filter(Boolean);

  return {
    id: response.id,
    firstName: person.firstName || '',
    lastName: person.lastName || '',
    email: primaryEmail?.value || '',
    phone: primaryPhone?.value || '',
    dateOfBirth: person.dateOfBirth,
    gender: person.gender,
    civilStatus: person.civilStatus,
    placeOfWork: person.placeOfWork,
    ageGroup: person.ageGroup,
    address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
    groupMemberships: response.groupMemberships,
  };
}

const ContactDetail = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const fetchContact = () => {
    if (!contactId) return;
    
    get(
      `${remoteRoutes.contacts}/${contactId}`,
      (response) => {
        setContact(mapApiResponse(response));
        setLoading(false);
      },
      (error) => {
        console.error('Contact detail error:', error);
        setLoading(false);
      }
    );
  };

  const handleEdit = () => {
    setEditDialog(true);
  };

  const handleEditSave = () => {
    setEditDialog(false);
    fetchContact(); // Refresh data
  };

  const getInitials = (contact: ContactData) => {
    const first = contact.firstName?.[0] || '';
    const last = contact.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const fullName = contact
    ? `${contact.firstName} ${contact.lastName}`.trim() || 'Unknown'
    : '';

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Loading Contact...
        </Typography>
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Contact Not Found
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(localRoutes.contacts)}
        >
          Back to Contacts
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(localRoutes.contacts)}
        >
          Back
        </Button>
        <Typography variant="h4" flex={1}>
          Contact Details
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {getInitials(contact)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {fullName}
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1} mt={3}>
                {contact.email && (
                  <Chip
                    icon={<EmailIcon />}
                    label={contact.email}
                    variant="outlined"
                    size="small"
                  />
                )}
                {contact.phone && (
                  <Chip
                    icon={<PhoneIcon />}
                    label={contact.phone}
                    variant="outlined"
                    size="small"
                  />
                )}
                {contact.groupMemberships?.map((gm) => gm.group && (
                  <Chip
                    key={gm.group.id}
                    icon={<GroupIcon />}
                    label={gm.group.name}
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText
                    primary="Full Name"
                    secondary={fullName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CalendarIcon /></ListItemIcon>
                  <ListItemText
                    primary="Date of Birth"
                    secondary={formatDate(contact.dateOfBirth)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText
                    primary="Gender"
                    secondary={contact.gender || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText
                    primary="Marital Status"
                    secondary={contact.civilStatus || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WorkIcon /></ListItemIcon>
                  <ListItemText
                    primary="Place of Work"
                    secondary={contact.placeOfWork || 'Not specified'}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><EmailIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={contact.email || 'Not provided'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PhoneIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={contact.phone || 'Not provided'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LocationIcon /></ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={contact.address || 'Not provided'}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Church Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><GroupIcon /></ListItemIcon>
                  <ListItemText
                    primary="Group Memberships"
                    secondary={
                      contact.groupMemberships && contact.groupMemberships.length > 0
                        ? contact.groupMemberships.map(gm => gm.group?.name).filter(Boolean).join(', ')
                        : 'Not assigned'
                    }
                  />
                </ListItem>
              </List>

              {contact.ageGroup && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Additional Info
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText
                        primary="Age Group"
                        secondary={contact.ageGroup}
                      />
                    </ListItem>
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Edit Contact</DialogTitle>
        <DialogContent>
          <ContactForm
            contactId={contactId}
            onSave={handleEditSave}
            onCancel={() => setEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ContactDetail;