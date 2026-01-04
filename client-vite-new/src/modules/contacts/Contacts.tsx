import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { search } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import ContactForm from './ContactForm';
import BulkUpload from './BulkUpload';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  location?: {
    id: string;
    name: string;
  };
  cellGroup?: {
    id: string;
    name: string;
  };
}

interface ContactFilter {
  search?: string;
  limit?: number;
  offset?: number;
}

const Contacts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [filter, setFilter] = useState<ContactFilter>({
    limit: 50,
  });

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.contacts,
      { ...filter, search: searchTerm || undefined },
      (response) => {
        console.log('Contacts response:', response);
        setContacts(response || []);
        setLoading(false);
      },
      (error) => {
        console.error('Contacts error:', error);
        setLoading(false);
      }
    );
  }, [filter, searchTerm]);

  const handleSearch = () => {
    setFilter({ ...filter, search: searchTerm });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Loading Contacts...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          People ({contacts.length})
        </Typography>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialog(true)}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            {isMobile ? '' : 'Add New'}
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Search people..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Desktop Grid View */}
      {!isMobile ? (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
          {contacts.map((contact) => (
            <Card key={contact.id} elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {getInitials(contact.name)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography 
                      variant="h6" 
                      noWrap 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`${localRoutes.contacts}/${contact.id}`)}
                    >
                      {contact.name}
                    </Typography>
                    {contact.cellGroup && (
                      <Chip 
                        label={contact.cellGroup.name} 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`${localRoutes.contacts}/${contact.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <PhoneIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {contact.phone || 'No phone'}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <EmailIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {contact.email || 'No email'}
                  </Typography>
                </Box>
                
                {contact.dateOfBirth && (
                  <Typography variant="caption" color="text.secondary">
                    DOB: {formatDate(contact.dateOfBirth)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        /* Mobile List View */
        <List>
          {contacts.map((contact) => (
            <ListItem key={contact.id} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getInitials(contact.name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={contact.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {contact.phone || 'No phone'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {contact.email || 'No email'}
                    </Typography>
                    {contact.cellGroup && (
                      <Chip 
                        label={contact.cellGroup.name} 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end"
                  onClick={() => navigate(`${localRoutes.contacts}/${contact.id}`)}
                >
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {contacts.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No contacts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first contact to get started
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}>
            Add Contact
          </Button>
        </Box>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setCreateDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* New Contact Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent>
          <ContactForm
            onSave={() => {
              setCreateDialog(false);
              // Refresh contacts list
              setFilter({ ...filter });
            }}
            onCancel={() => setCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Contacts</DialogTitle>
        <DialogContent>
          <BulkUpload
            onComplete={() => {
              setUploadDialog(false);
              // Refresh contacts list
              setFilter({ ...filter });
            }}
            onCancel={() => setUploadDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Contacts;