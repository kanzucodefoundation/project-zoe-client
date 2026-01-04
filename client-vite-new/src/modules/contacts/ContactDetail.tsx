import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
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
  Emergency as EmergencyIcon,
  Notes as NotesIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { get } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import ContactForm from './ContactForm';

interface ContactDetail {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
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
  cellGroup?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ContactDetail = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<ContactDetail | null>(null);
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
        console.log('Contact detail response:', response);
        setContact(response);
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = (address?: ContactDetail['address']) => {
    if (!address) return 'Not provided';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Loading Contact...
        </Typography>
      </Container>
    );
  }

  if (!contact) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Contact Not Found
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(localRoutes.contacts)}
        >
          Back to Contacts
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
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
                {getInitials(contact.firstName, contact.lastName)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {contact.name}
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
                {contact.cellGroup && (
                  <Chip
                    icon={<GroupIcon />}
                    label={contact.cellGroup.name}
                    color="primary"
                    size="small"
                  />
                )}
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
                    secondary={`${contact.firstName} ${contact.lastName}`} 
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
                    secondary={contact.maritalStatus || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WorkIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Occupation" 
                    secondary={contact.occupation || 'Not specified'} 
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
                    secondary={formatAddress(contact.address)} 
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
                    primary="Cell Group" 
                    secondary={contact.cellGroup?.name || 'Not assigned'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LocationIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Location" 
                    secondary={contact.location?.name || 'Not assigned'} 
                  />
                </ListItem>
              </List>

              {contact.emergencyContact && (contact.emergencyContact.name || contact.emergencyContact.phone) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Emergency Contact
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><EmergencyIcon /></ListItemIcon>
                      <ListItemText 
                        primary={contact.emergencyContact.name || 'Not provided'}
                        secondary={
                          <Box>
                            {contact.emergencyContact.phone && (
                              <Typography variant="body2">
                                Phone: {contact.emergencyContact.phone}
                              </Typography>
                            )}
                            {contact.emergencyContact.relationship && (
                              <Typography variant="body2">
                                Relationship: {contact.emergencyContact.relationship}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </>
              )}

              {contact.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><NotesIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Additional Notes" 
                        secondary={contact.notes} 
                      />
                    </ListItem>
                  </List>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                Created: {formatDate(contact.createdAt)} | 
                Last Updated: {formatDate(contact.updatedAt)}
              </Typography>
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
    </Container>
  );
};

export default ContactDetail;