import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { get, post, patch, del, search } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
  fullName?: string;
  contactId: number;
}

interface ContactOption {
  id: number;
  name: string;
  avatar?: string | null;
}

interface RoleDto {
  id: number;
  role: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

interface CreateUserData {
  contact: ContactOption | null;
  password: string;
  roles: string[];
  isActive: boolean;
}

interface EditUserData {
  password: string;
  roles: string[];
  isActive: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isActiveStatus, setIsActiveStatus] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactQuery, setContactQuery] = useState('');
  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    contact: null,
    password: '',
    roles: [],
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState<EditUserData>({
    password: '',
    roles: [],
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  useEffect(() => {
    if (!createDialog) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      fetchCreateContacts(contactQuery);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [contactQuery, createDialog]);

  const fetchUsers = (search: string = '') => {
    const url = search 
      ? `${remoteRoutes.users}?query=${encodeURIComponent(search)}`
      : remoteRoutes.users;
    
    get(
      url,
      (response) => {
        console.log('Users response:', response);
        setUsers(response || []);
        setLoading(false);
      },
      (error) => {
        console.error('Users error:', error);
        setLoading(false);
      }
    );
  };

  const fetchAvailableRoles = () => {
    get(
      remoteRoutes.roles,
      (response: RoleDto[] = []) => {
        const activeRoles = response
          .filter((role) => role.isActive)
          .map((role) => role.role);
        setAvailableRoles(activeRoles);
      },
      () => {
        setAvailableRoles([]);
      }
    );
  };

  const fetchCreateContacts = (query: string = '') => {
    setLoadingContacts(true);
    search(
      remoteRoutes.contactsPeopleCombo,
      {
        skipUsers: true,
        query,
        limit: 300,
      },
      (response: ContactOption[] = []) => {
        setContactOptions(Array.isArray(response) ? response : []);
        setLoadingContacts(false);
      },
      () => {
        setContactOptions([]);
        setLoadingContacts(false);
      }
    );
  };

  const handleCreateUser = () => {
    setCreateFormData({
      contact: null,
      password: '',
      roles: [],
      isActive: true,
    });
    setContactQuery('');
    fetchCreateContacts('');
    if (!availableRoles.length) {
      fetchAvailableRoles();
    }
    setCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialog(false);
    setSubmitting(false);
  };

  const handleCreateFormChange = <K extends keyof CreateUserData>(
    field: K,
    value: CreateUserData[K],
  ) => {
    setCreateFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = <K extends keyof EditUserData>(
    field: K,
    value: EditUserData[K],
  ) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCreateRole = (role: string) => {
    const currentRoles = createFormData.roles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((existingRole) => existingRole !== role)
      : [...currentRoles, role];
    handleCreateFormChange('roles', newRoles);
  };

  const toggleEditRole = (role: string) => {
    const currentRoles = editFormData.roles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((existingRole) => existingRole !== role)
      : [...currentRoles, role];
    handleEditFormChange('roles', newRoles);
  };

  const getContactOptionLabel = (option: ContactOption) => option?.name ?? '';

  const handleSubmitCreate = () => {
    if (!createFormData.contact) {
      return;
    }

    setSubmitting(true);
    post(
      remoteRoutes.users,
      {
        contactId: createFormData.contact.id,
        password: createFormData.password,
        roles: createFormData.roles,
        isActive: createFormData.isActive,
      },
      () => {
        setCreateDialog(false);
        fetchUsers();
        setSubmitting(false);
      },
      () => {
        setSubmitting(false);
      }
    );
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsActiveStatus(user.isActive);
    setEditFormData({
      password: '',
      roles: user.roles,
      isActive: user.isActive,
    });
    if (!availableRoles.length) {
      fetchAvailableRoles();
    }
    setEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialog(false);
    setSubmitting(false);
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      del(
        `${remoteRoutes.users}/${user.id}`,
        () => {
          fetchUsers();
        },
        (error) => {
          console.error('Delete user error:', error);
        }
      );
    }
  };

  const handleSubmitEdit = () => {
    if (!selectedUser) return;

    setSubmitting(true);

    const updateData: any = {
      id: selectedUser.id,
      roles: editFormData.roles,
      isActive: isActiveStatus,
    };

    if (editFormData.password) {
      updateData.password = editFormData.password;
    }

    patch(
      `${remoteRoutes.users}/${selectedUser.id}`,
      updateData,
      () => {
        setEditDialog(false);
        fetchUsers();
        setSubmitting(false);
      },
      (error) => {
        console.error('Update user error:', error);
        setSubmitting(false);
      }
    );
  };

  const filteredUsers = users;

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Loading Users...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          User Management ({users.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
        >
          Add User
        </Button>
      </Box>

      {/* Search */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Search by username, email, first name, or last name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchUsers(e.target.value);
          }}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={user.avatar || undefined}
                      sx={{ bgcolor: 'primary.main' }}
                    >
                      {getInitials(user)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {user.firstName && user.lastName
                          ? `${user.fullName}`
                          : user.fullName
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {user.roles.slice(0, 3).map((role) => (
                      <Chip key={role} label={role} size="small" variant="outlined" />
                    ))}
                    {user.roles.length > 3 && (
                      <Chip label={`+${user.roles.length - 3}`} size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditUser(user)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteUser(user)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            No users found matching your search.
          </Typography>
        </Box>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box pt={1} display="flex" flexDirection="column" gap={2}>
            <Autocomplete
              options={contactOptions}
              value={createFormData.contact}
              loading={loadingContacts}
              onChange={(_, value) => handleCreateFormChange('contact', value)}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') {
                  setContactQuery(value);
                }
              }}
              getOptionLabel={getContactOptionLabel}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={contactQuery ? 'No matching people found' : 'No people available'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Person"
                  required
                  helperText="Only contacts without existing user accounts are listed"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingContacts ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <TextField
              label="Password"
              type="text"
              required
              value={createFormData.password}
              onChange={(e) => handleCreateFormChange('password', e.target.value)}
              helperText="Must be at least 8 characters"
            />
            <FormControlLabel
              label={createFormData.isActive ? 'Active' : 'Inactive'}
              control={
                <Switch
                  color={createFormData.isActive ? 'success' : 'default'}
                  checked={createFormData.isActive}
                  onChange={(e) => handleCreateFormChange('isActive', e.target.checked)}
                />
              }
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Roles:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  onClick={() => toggleCreateRole(role)}
                  color={createFormData.roles.includes(role) ? 'primary' : 'default'}
                  variant={createFormData.roles.includes(role) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Password will be sent exactly as shown
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitCreate}
            disabled={
              submitting
              || !createFormData.contact
              || createFormData.password.length < 8
              || createFormData.roles.length === 0
            }
          >
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <Box pt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Password"
              type="password"
              value={editFormData.password}
              onChange={(e) => handleEditFormChange('password', e.target.value)}
              helperText="Leave blank to keep current password"
            />
            <FormControlLabel
              label={isActiveStatus ? 'Active' : 'Inactive'}
              control={
                <Switch
                  color={isActiveStatus ? 'success' : 'default'}
                  checked={isActiveStatus}
                  onChange={(e) => setIsActiveStatus(e.target.checked)}
                />
              }
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Roles:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  onClick={() => toggleEditRole(role)}
                  color={editFormData.roles.includes(role) ? 'primary' : 'default'}
                  variant={editFormData.roles.includes(role) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitEdit}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
