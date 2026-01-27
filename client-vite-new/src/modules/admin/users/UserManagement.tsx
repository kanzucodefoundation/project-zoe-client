import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { get, post, put, del } from '../../../utils/ajax';
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
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

const availableRoles = [
  'DASHBOARD',
  'CRM_VIEW',
  'CRM_EDIT',
  'USER_VIEW',
  'USER_EDIT',
  'ROLE_EDIT',
  'TAG_VIEW',
  'TAG_EDIT',
  'GROUP_VIEW',
  'GROUP_EDIT',
  'MC_VIEW',
  'EVENT_VIEW',
  'EVENT_EDIT',
  'REPORT_VIEW',
  'REPORT_VIEW_SUBMISSIONS',
  'MANAGE_HELP',
];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roles: [],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    get(
      remoteRoutes.users,
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

  const handleCreateUser = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      roles: [],
    });
    setCreateDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't pre-fill password
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roles: user.roles,
    });
    setEditDialog(true);
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

  const handleSubmitCreate = () => {
    setSubmitting(true);
    post(
      remoteRoutes.users,
      formData,
      () => {
        setCreateDialog(false);
        fetchUsers();
        setSubmitting(false);
      },
      (error) => {
        console.error('Create user error:', error);
        setSubmitting(false);
      }
    );
  };

  const handleSubmitEdit = () => {
    if (!selectedUser) return;

    setSubmitting(true);

    // Backend expects: id, username, roles, isActive (password is optional and excluded from edit)
    const updateData = {
      id: selectedUser.id,
      username: formData.username,
      roles: formData.roles,
      isActive: selectedUser.isActive,
    };

    put(
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

  const handleFormChange = (field: keyof CreateUserData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (role: string) => {
    const currentRoles = formData.roles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    handleFormChange('roles', newRoles);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          onChange={(e) => setSearchTerm(e.target.value)}
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
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getInitials(user)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
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
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box pt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Username"
              required
              value={formData.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
              />
            </Box>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Roles:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  onClick={() => handleRoleToggle(role)}
                  color={formData.roles.includes(role) ? 'primary' : 'default'}
                  variant={formData.roles.includes(role) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitCreate}
            disabled={submitting || !formData.username || !formData.email || !formData.password}
          >
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <Box pt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Username"
              required
              value={formData.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              disabled
              helperText="Email cannot be changed"
            />
            <Box display="flex" gap={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
                disabled
                helperText="Read-only"
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
                disabled
                helperText="Read-only"
              />
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Roles:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  onClick={() => handleRoleToggle(role)}
                  color={formData.roles.includes(role) ? 'primary' : 'default'}
                  variant={formData.roles.includes(role) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitEdit}
            disabled={submitting || !formData.username}
          >
            {submitting ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;