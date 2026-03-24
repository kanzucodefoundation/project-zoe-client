import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  MoreVert as MoreVertIcon,
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
  avatar?: string;
}

interface ContactFilter {
  limit?: number;
  skip?: number;
}

const CONTACT_FETCH_LIMIT = 100;

const Contacts = () => {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [createDialog, setCreateDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [filter, setFilter] = useState<ContactFilter>({
    limit: CONTACT_FETCH_LIMIT,
    skip: 0,
  });
  const [total, setTotal] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const paginatedContacts = contacts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  useEffect(() => {
    let active = true;

    const loadAllContacts = async () => {
      setLoading(true);

      const collected: Contact[] = [];
      let skip = 0;

      try {
        while (true) {
          const batch = await new Promise<Contact[]>((resolve, reject) => {
            search(
              remoteRoutes.contacts,
              {
                ...filter,
                skip,
                query: appliedSearch || undefined,
              },
              (response) => {
                const data: Contact[] = Array.isArray(response)
                  ? response
                  : response?.data ?? [];
                resolve(data);
              },
              reject,
            );
          });

          collected.push(...batch);

          if (batch.length < CONTACT_FETCH_LIMIT) {
            break;
          }

          skip += CONTACT_FETCH_LIMIT;
        }

        if (!active) return;

        setContacts(collected);
        setTotal(collected.length);
      } catch (error) {
        if (!active) return;
        console.error('Contacts error:', error);
        setContacts([]);
        setTotal(0);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAllContacts();

    return () => {
      active = false;
    };
  }, [appliedSearch, filter]);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= contacts.length) {
      setPage(Math.max(0, Math.ceil(contacts.length / rowsPerPage) - 1));
    }
  }, [contacts.length, page, rowsPerPage]);

  const handleSearch = () => {
    setAppliedSearch(searchInput.trim());
    setPage(0);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    contact: Contact,
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContact(null);
  };

  const handleViewDetails = () => {
    if (selectedContact) {
      navigate(`${localRoutes.contacts}/${selectedContact.id}`);
    }
    handleMenuClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" gutterBottom>
          People ({total || contacts.length})
        </Typography>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialog(true)}
          >
            Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            Add New
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Search people..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Table */}
      {contacts.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No contacts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first contact to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            Add Contact
          </Button>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 64, fontWeight: 'bold' }}>
                    #
                  </TableCell>
                  <TableCell sx={{ width: 56 }}></TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Phone
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Group
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Date of Birth
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedContacts.map((contact, idx) => (
                  <TableRow
                    key={contact.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() =>
                      navigate(`${localRoutes.contacts}/${contact.id}`)
                    }
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={contact.avatar || undefined}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                          fontSize: '14px',
                        }}
                      >
                        {getInitials(contact.name)}
                      </Avatar>
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                    >
                      {contact.name}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#1976d2', textDecoration: 'none' }}
                        >
                          {contact.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#1976d2', textDecoration: 'none' }}
                        >
                          {contact.phone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {contact.cellGroup?.name || '-'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(contact.dateOfBirth)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, contact)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Bottom-right paginator */}
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                const newLimit = parseInt(e.target.value, 10);
                setRowsPerPage(newLimit);
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </Box>
        </>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        <MenuItem onClick={handleViewDetails}>Edit</MenuItem>
      </Menu>

      {/* New Contact Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent>
          <ContactForm
            onSave={() => {
              setCreateDialog(false);
              // Refresh contacts list; keep same pagination
              setFilter((prev) => ({ ...prev }));
            }}
            onCancel={() => setCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Contacts</DialogTitle>
        <DialogContent>
          <BulkUpload
            onComplete={() => {
              setUploadDialog(false);
              // Refresh contacts list
              setFilter((prev) => ({ ...prev }));
            }}
            onCancel={() => setUploadDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Contacts;
