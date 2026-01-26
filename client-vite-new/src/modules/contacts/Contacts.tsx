import { useState, useEffect, useMemo, useCallback } from 'react';
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
}

interface ContactFilter {
  search?: string;
  limit?: number;
  offset?: number;
}

const Contacts = () => {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Visible input text that should NOT trigger reload while typing
  const [searchInput, setSearchInput] = useState('');

  // The applied search term used in requests; set only when user submits search
  const [appliedSearch, setAppliedSearch] = useState<string>('');

  const [createDialog, setCreateDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);

  // Pagination-aware filter: limit + offset; search applied via appliedSearch
  const [filter, setFilter] = useState<ContactFilter>({
    limit: 50,
    offset: 0,
    search: '',
  });

  // Optional total count if API returns it
  const [total, setTotal] = useState<number>(0);

  // Actions menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Derive pagination UI state from filter
  const rowsPerPage = filter.limit || 25;
  const page = Math.floor((filter.offset || 0) / rowsPerPage);

  // Build query params memoized to avoid unnecessary reloads
  const queryParams = useMemo(
    () => ({
      ...filter,
      email: appliedSearch || undefined, 
    }),
    [filter, appliedSearch]
  );

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.contacts,
      queryParams,
      (response) => {
        // Support both array and { data, total } shapes
        const data: Contact[] = Array.isArray(response) ? response : response?.data ?? [];
        const totalCount =
          (Array.isArray(response) ? response.length : response?.total) ?? data.length;

        setContacts(data || []);
        setTotal(totalCount);
        setLoading(false);
      },
      (error) => {
        console.error('Contacts error:', error);
        setLoading(false);
      }
    );
  }, [queryParams]);

  // Trigger search only when the user clicks the button or presses Enter.
  const handleSearch = useCallback(() => {
    setAppliedSearch(searchInput.trim());
    // Reset to first page on new search
    setFilter((prev) => ({ ...prev, offset: 0 }));
  }, [searchInput]);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, contact: Contact) => {
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          People ({total || contacts.length})
        </Typography>

        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setUploadDialog(true)}>
            Upload
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}>
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
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}>
            Add Contact
          </Button>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell sx={{ width: 64, fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ width: 56 }}></TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Group</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Date of Birth
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact, idx) => (
                  <TableRow
                    key={contact.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`${localRoutes.contacts}/${contact.id}`)}
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell>
                      <Avatar
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
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
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
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, contact)}>
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
                count={total || contacts.length}
                page={page}
                onPageChange={(_, newPage) => {
                  const newOffset = newPage * rowsPerPage;
                  setFilter((prev) => ({ ...prev, offset: newOffset }));
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  const newLimit = parseInt(e.target.value, 10);
                  // Reset to first page when page size changes
                  setFilter((prev) => ({ ...prev, limit: newLimit }));
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Box>
        </>
      )}

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        <MenuItem onClick={handleViewDetails}>Edit</MenuItem>
      </Menu>

      {/* New Contact Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
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
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="md" fullWidth>
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