import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Tabs,
  Tab,
  Alert,
  useMediaQuery,
  useTheme,
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
import {
  remoteRoutes,
  localRoutes,
  appPermissions,
} from '../../data/constants';
import {
  ContactStatus,
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_COLORS,
} from '../../utils/types';
import type { RootState } from '../../data/store';
import { canViewTasks, hasAnyCapability } from '../../utils/permissions';
import ContactForm from './ContactForm';
import ContactTasksTab from '../tasks/ContactTasksTab';
import ContactActivityFeed from './ContactActivityFeed';

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
  status?: ContactStatus;
  groupMemberships?: Array<{ group?: { id: number; name: string } }>;
  avatar?: string;
}

function mapApiResponse(response: any): ContactData {
  const person = response.person || {};
  const primaryEmail =
    response.emails?.find((e: any) => e.isPrimary) || response.emails?.[0];
  const primaryPhone =
    response.phones?.find((p: any) => p.isPrimary) || response.phones?.[0];
  const primaryAddress =
    response.addresses?.find((a: any) => a.isPrimary) ||
    response.addresses?.[0];

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
    status: response.status as ContactStatus | undefined,
    groupMemberships: response.groupMemberships,
  };
}

const ContactDetail = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const canViewContactEditActions = hasAnyCapability(user, [
    appPermissions.roleCrmEdit,
  ]);
  const canViewTaskTab = canViewTasks(user);

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
      },
    );
  };

  const handleEdit = () => {
    if (!canViewContactEditActions) {
      return;
    }
    setEditError(null);
    setEditDialog(true);
  };

  const handleEditSave = () => {
    setEditError(null);
    setEditDialog(false);
    fetchContact();
  };

  const getInitials = (contact: ContactData) => {
    const first = contact.firstName?.[0] || '';
    const last = contact.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    // Parse parts directly to avoid timezone shifts on date-only strings.
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    // Year 1900 is the sentinel for "year not captured" — show day + month only.
    if (year === 1900) {
      return new Date(1900, month - 1, day).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
      });
    }
    return new Date(year, month - 1, day).toLocaleDateString();
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
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={1.5}
        mb={{ xs: 2, sm: 3 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(localRoutes.contacts)}
          fullWidth={isMobile}
        >
          Back
        </Button>
        <Typography variant="h4" flex={1}>
          Contact Details
        </Typography>
        {canViewContactEditActions ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            fullWidth={isMobile}
          >
            Edit
          </Button>
        ) : null}
      </Box>

      <Grid container spacing={{ xs: 2, md: 6 }}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={contact.avatar || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.paper',
                  fontSize: '2rem',
                }}
              >
                {getInitials(contact)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {fullName}
              </Typography>
              {contact.status && (
                <Chip
                  label={CONTACT_STATUS_LABELS[contact.status]}
                  color={CONTACT_STATUS_COLORS[contact.status]}
                  size="small"
                  sx={{ mb: 1 }}
                />
              )}

              <Box display="flex" flexDirection="column" gap={1} mt={3}>
                {contact.email && (
                  <Chip
                    icon={<EmailIcon />}
                    label={contact.email}
                    variant="outlined"
                    size="medium"
                  />
                )}
                {contact.phone && (
                  <Chip
                    icon={<PhoneIcon />}
                    label={contact.phone}
                    variant="outlined"
                    size="medium"
                  />
                )}
                {contact.groupMemberships?.map(
                  (gm) =>
                    gm.group && (
                      <Chip
                        key={gm.group.id}
                        icon={<GroupIcon />}
                        label={gm.group.name}
                        color="primary"
                        size="medium"
                        clickable
                        onClick={() =>
                          navigate(`${localRoutes.groups}/${gm.group!.id}`)
                        }
                      />
                    ),
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs + Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              <Tab label="Profile" />
              {canViewTaskTab ? <Tab label="Tasks" /> : null}
              <Tab label="Activity" />
            </Tabs>
          </Box>

          {/* Profile Tab */}
          {activeTab === 0 && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <List>
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="Full Name" secondary={fullName} />
                  </ListItem>
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date of Birth"
                      secondary={formatDate(contact.dateOfBirth)}
                    />
                  </ListItem>
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Gender"
                      secondary={contact.gender || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Marital Status"
                      secondary={contact.civilStatus || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <WorkIcon />
                    </ListItemIcon>
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
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={contact.email || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={contact.phone || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <LocationIcon />
                    </ListItemIcon>
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
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Status"
                      secondary={
                        contact.status
                          ? CONTACT_STATUS_LABELS[contact.status]
                          : 'Active'
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', fontSize: 28 }}>
                      <GroupIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Group Memberships"
                      secondary={
                        contact.groupMemberships &&
                        contact.groupMemberships.length > 0
                          ? contact.groupMemberships
                              .map((gm) => gm.group?.name)
                              .filter(Boolean)
                              .join(', ')
                          : 'Not assigned'
                      }
                    />
                  </ListItem>
                </List>

                {contact.ageGroup && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Additional Info
                        </Typography>
                        <List>
                          <ListItem sx={{ gap: 2 }}>
                            <ListItemIcon
                              sx={{ minWidth: 'auto', fontSize: 28 }}
                            >
                              <PersonIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary="Age Group"
                              secondary={contact.ageGroup}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tasks Tab */}
          {canViewTaskTab && activeTab === 1 && (
            <ContactTasksTab contactId={contact.id} />
          )}

          {/* Activity Tab */}
          {activeTab === (canViewTaskTab ? 2 : 1) && (
            <ContactActivityFeed contactId={contact.id} />
          )}
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => {
          setEditError(null);
          setEditDialog(false);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
      >
        <DialogTitle>Edit Contact</DialogTitle>
        <DialogContent dividers={isMobile}>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <ContactForm
            contactId={contactId}
            onSave={handleEditSave}
            onCancel={() => {
              setEditError(null);
              setEditDialog(false);
            }}
            onError={(message) => setEditError(message || null)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ContactDetail;
