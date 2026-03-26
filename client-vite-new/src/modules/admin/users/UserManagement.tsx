import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  TablePagination,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, post, patch, put, del, search } from '../../../utils/ajax';
import {
  remoteRoutes,
  appPermissions,
  permissionsList,
} from '../../../data/constants';
import type { RootState } from '../../../data/store';
import type {
  User,
  ContactOption,
  RoleDto,
  AuthUserWithPermissions,
  CreateUserData,
  EditUserData,
  RoleFormData,
} from './types';

const USER_FETCH_LIMIT = 100;

const INITIAL_CREATE_FORM: CreateUserData = {
  contact: null,
  password: '',
  roles: [],
  isActive: true,
};

const INITIAL_EDIT_FORM: EditUserData = {
  password: '',
  roles: [],
  isActive: true,
};

const INITIAL_ROLE_FORM: RoleFormData = {
  role: '',
  description: '',
  permissions: [],
  isActive: true,
};

const getUserCapabilities = (user: RootState['core']['user']) => {
  const permissions = Array.isArray(
    (user as AuthUserWithPermissions | null)?.permissions,
  )
    ? (user as AuthUserWithPermissions).permissions ?? []
    : [];
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return new Set([...permissions, ...roles]);
};

const UserManagement = () => {
  const user = useSelector((state: RootState) => state.core.user);
  const canManageRoles = getUserCapabilities(user).has(appPermissions.roleEdit);

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [reloadUsersKey, setReloadUsersKey] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactQuery, setContactQuery] = useState('');
  const [createFormData, setCreateFormData] =
    useState<CreateUserData>(INITIAL_CREATE_FORM);
  const [editFormData, setEditFormData] =
    useState<EditUserData>(INITIAL_EDIT_FORM);

  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleDialog, setRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [roleFormData, setRoleFormData] =
    useState<RoleFormData>(INITIAL_ROLE_FORM);
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleDto | null>(null);
  const [confirmDeleteUserOpen, setConfirmDeleteUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'roles' && !canManageRoles) {
      setActiveTab('users');
    }
  }, [activeTab, canManageRoles]);

  useEffect(() => {
    let active = true;

    const fetchUsers = async () => {
      setUsersLoading(true);

      const collected: User[] = [];
      let skip = 0;

      try {
        while (true) {
          const batch = await new Promise<User[]>((resolve, reject) => {
            search(
              remoteRoutes.users,
              {
                query: appliedSearch || undefined,
                limit: USER_FETCH_LIMIT,
                skip,
              },
              (response) => resolve(Array.isArray(response) ? response : []),
              reject,
            );
          });

          collected.push(...batch);

          if (batch.length < USER_FETCH_LIMIT) {
            break;
          }

          skip += USER_FETCH_LIMIT;
        }

        if (!active) {
          return;
        }

        setUsers(collected);
      } catch (error) {
        if (!active) {
          return;
        }

        console.error('Users error:', error);
        setUsers([]);
      } finally {
        if (active) {
          setUsersLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      active = false;
    };
  }, [appliedSearch, reloadUsersKey]);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= users.length) {
      setPage(Math.max(0, Math.ceil(users.length / rowsPerPage) - 1));
    }
  }, [users.length, page, rowsPerPage]);

  useEffect(() => {
    fetchRoles();
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

  const fetchRoles = () => {
    setRolesLoading(true);

    get(
      remoteRoutes.roles,
      (response: RoleDto[] = []) => {
        const normalized = (Array.isArray(response) ? response : [])
          .map((role) => ({
            ...role,
            description: role.description ?? '',
            permissions: Array.isArray(role.permissions)
              ? role.permissions
              : [],
          }))
          .sort((left, right) => left.role.localeCompare(right.role));

        setRoles(normalized);
        setAvailableRoles(
          normalized.filter((role) => role.isActive).map((role) => role.role),
        );
        setRolesLoading(false);
      },
      () => {
        setRoles([]);
        setAvailableRoles([]);
        setRolesLoading(false);
      },
    );
  };

  const fetchCreateContacts = (query = '') => {
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
      },
    );
  };

  const handleCreateUser = () => {
    setCreateFormData(INITIAL_CREATE_FORM);
    setContactQuery('');
    fetchCreateContacts('');

    if (!availableRoles.length) {
      fetchRoles();
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

  const handleRoleFormChange = <K extends keyof RoleFormData>(
    field: K,
    value: RoleFormData[K],
  ) => {
    setRoleFormData((prev) => ({ ...prev, [field]: value }));
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
        toast.success('User created successfully');
        setCreateDialog(false);
        setReloadUsersKey((prev) => prev + 1);
        setSubmitting(false);
      },
      () => {
        setSubmitting(false);
      },
    );
  };

  const handleEditUser = (currentUser: User) => {
    setSelectedUser(currentUser);
    setEditFormData({
      password: '',
      roles: currentUser.roles,
      isActive: currentUser.isActive,
    });

    if (!availableRoles.length) {
      fetchRoles();
    }

    setEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialog(false);
    setSubmitting(false);
  };

  const handleDeleteUser = (currentUser: User) => {
    setUserToDelete(currentUser);
    setConfirmDeleteUserOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) {
      return;
    }

    setDeletingUserId(userToDelete.id);

    del(
      `${remoteRoutes.users}/${userToDelete.id}`,
      () => {
        toast.success('User deleted successfully');
        setDeletingUserId(null);
        setConfirmDeleteUserOpen(false);
        setUserToDelete(null);
        setReloadUsersKey((prev) => prev + 1);
      },
      (error) => {
        console.error('Delete user error:', error);
        setDeletingUserId(null);
      },
    );
  };

  const handleCloseConfirmDeleteUser = () => {
    setConfirmDeleteUserOpen(false);
    setUserToDelete(null);
  };

  const handleSubmitEdit = () => {
    if (!selectedUser) {
      return;
    }

    setSubmitting(true);

    const updateData: {
      id: string;
      roles: string[];
      isActive: boolean;
      password?: string;
    } = {
      id: selectedUser.id,
      roles: editFormData.roles,
      isActive: editFormData.isActive,
    };

    if (editFormData.password) {
      updateData.password = editFormData.password;
    }

    patch(
      `${remoteRoutes.users}/${selectedUser.id}`,
      updateData,
      () => {
        toast.success('User updated successfully');
        setEditDialog(false);
        setReloadUsersKey((prev) => prev + 1);
        setSubmitting(false);
      },
      (error) => {
        console.error('Update user error:', error);
        setSubmitting(false);
      },
    );
  };

  const handleCreateRoleDialog = () => {
    setSelectedRole(null);
    setRoleFormData(INITIAL_ROLE_FORM);
    setRoleDialog(true);
  };

  const handleEditRoleDialog = (role: RoleDto) => {
    setSelectedRole(role);
    setRoleFormData({
      id: role.id,
      role: role.role,
      description: role.description ?? '',
      permissions: [...role.permissions],
      isActive: role.isActive,
    });
    setRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setRoleDialog(false);
    setSelectedRole(null);
    setRoleFormData(INITIAL_ROLE_FORM);
    setRoleSubmitting(false);
  };

  const handleSubmitRole = () => {
    const trimmedRole = roleFormData.role.trim();
    const trimmedDescription = roleFormData.description.trim();

    if (
      !trimmedRole ||
      !trimmedDescription ||
      roleFormData.permissions.length === 0
    ) {
      return;
    }

    const payload = {
      ...roleFormData,
      id: selectedRole?.id ?? roleFormData.id,
      role: trimmedRole,
      description: trimmedDescription,
      permissions: [...roleFormData.permissions],
    };

    setRoleSubmitting(true);

    const onSuccess = () => {
      toast.success(
        selectedRole
          ? 'Role updated successfully'
          : 'Role created successfully',
      );
      setRoleDialog(false);
      setSelectedRole(null);
      setRoleFormData(INITIAL_ROLE_FORM);
      setRoleSubmitting(false);
      fetchRoles();
    };

    const onError = () => {
      setRoleSubmitting(false);
    };

    if (selectedRole) {
      put(remoteRoutes.roles, payload, onSuccess, onError);
      return;
    }

    post(remoteRoutes.roles, payload, onSuccess, onError);
  };

  const handleDeleteRole = (role: RoleDto) => {
    setRoleToDelete(role);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete) {
      return;
    }

    setDeletingRoleId(roleToDelete.id);

    del(
      `${remoteRoutes.roles}/${roleToDelete.id}`,
      () => {
        toast.success('Role deleted successfully');
        setDeletingRoleId(null);
        setConfirmDeleteOpen(false);
        setRoleToDelete(null);

        if (selectedRole?.id === roleToDelete.id) {
          setRoleDialog(false);
          setSelectedRole(null);
          setRoleFormData(INITIAL_ROLE_FORM);
          setRoleSubmitting(false);
        }

        fetchRoles();
      },
      () => {
        setDeletingRoleId(null);
      },
    );
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    setRoleToDelete(null);
  };

  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const getInitials = (currentUser: User) => {
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }

    return currentUser.username.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  const isRoleFormValid =
    roleFormData.role.trim().length > 0 &&
    roleFormData.description.trim().length > 0 &&
    roleFormData.permissions.length > 0;

  const renderUsersTab = () => {
    if (usersLoading) {
      return (
        <Container disableGutters>
          <Typography variant="h4" gutterBottom>
            Loading Users...
          </Typography>
        </Container>
      );
    }

    return (
      <>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          gap={2}
          flexWrap="wrap"
        >
          <Typography variant="h5">Users ({users.length})</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Search by username, email, first name, or last name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                setAppliedSearch(searchTerm.trim());
                setPage(0);
              }
            }}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setAppliedSearch(searchTerm.trim());
              setPage(0);
            }}
          >
            Search
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((currentUser) => (
                <TableRow key={currentUser.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={currentUser.avatar || undefined}
                        sx={{ bgcolor: 'primary.main' }}
                      >
                        {getInitials(currentUser)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {currentUser.fullName || currentUser.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{currentUser.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {currentUser.roles.slice(0, 3).map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {currentUser.roles.length > 3 && (
                        <Chip
                          label={`+${currentUser.roles.length - 3}`}
                          size="small"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={currentUser.isActive ? 'Active' : 'Inactive'}
                      color={currentUser.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {currentUser.lastLogin
                      ? formatDate(currentUser.lastLogin)
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditUser(currentUser)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteUser(currentUser)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="flex-end" mt={1}>
          <TablePagination
            component="div"
            count={users.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Box>

        {users.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No users found matching your search.
            </Typography>
          </Box>
        )}
      </>
    );
  };

  const renderRolesTab = () => (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        gap={2}
        flexWrap="wrap"
      >
        <Typography variant="h5">Manage Roles ({roles.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRoleDialog}
        >
          Add Role
        </Button>
      </Box>

      {rolesLoading ? (
        <Box py={6} textAlign="center">
          <CircularProgress size={28} />
          <Typography color="text.secondary" mt={2}>
            Loading roles...
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Chip
                      label={role.isActive ? 'Active' : 'Inactive'}
                      color={role.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{role.role}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {role.permissions.map((permission) => (
                        <Chip
                          key={`${role.id}-${permission}`}
                          label={permission}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditRoleDialog(role)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteRole(role)}
                      size="small"
                      color="error"
                      disabled={deletingRoleId === role.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!rolesLoading && roles.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            No roles have been created yet.
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(_, value: 'users' | 'roles') => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Users" value="users" />
          {canManageRoles && <Tab label="Manage Roles" value="roles" />}
        </Tabs>
      </Box>

      {activeTab === 'users' ? renderUsersTab() : renderRolesTab()}

      <Dialog
        open={createDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
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
              noOptionsText={
                contactQuery
                  ? 'No matching people found'
                  : 'No people available'
              }
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
                        {loadingContacts ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
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
              onChange={(event) =>
                handleCreateFormChange('password', event.target.value)
              }
              helperText="Must be at least 8 characters"
            />
            <FormControlLabel
              label={createFormData.isActive ? 'Active' : 'Inactive'}
              control={
                <Switch
                  color={createFormData.isActive ? 'success' : 'default'}
                  checked={createFormData.isActive}
                  onChange={(event) =>
                    handleCreateFormChange('isActive', event.target.checked)
                  }
                />
              }
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Roles:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  onClick={() => toggleCreateRole(role)}
                  color={
                    createFormData.roles.includes(role) ? 'primary' : 'default'
                  }
                  variant={
                    createFormData.roles.includes(role) ? 'filled' : 'outlined'
                  }
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
              submitting ||
              !createFormData.contact ||
              createFormData.password.length < 8 ||
              createFormData.roles.length === 0
            }
          >
            {submitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <Box pt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Password"
              type="password"
              value={editFormData.password}
              onChange={(event) =>
                handleEditFormChange('password', event.target.value)
              }
              helperText="Leave blank to keep current password"
            />
            <FormControlLabel
              label={editFormData.isActive ? 'Active' : 'Inactive'}
              control={
                <Switch
                  color={editFormData.isActive ? 'success' : 'default'}
                  checked={editFormData.isActive}
                  onChange={(event) =>
                    handleEditFormChange('isActive', event.target.checked)
                  }
                />
              }
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Roles:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {availableRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  onClick={() => toggleEditRole(role)}
                  color={
                    editFormData.roles.includes(role) ? 'primary' : 'default'
                  }
                  variant={
                    editFormData.roles.includes(role) ? 'filled' : 'outlined'
                  }
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

      <Dialog
        open={roleDialog}
        onClose={handleCloseRoleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRole ? `Edit Role: ${selectedRole.role}` : 'Create Role'}
        </DialogTitle>
        <DialogContent>
          <Box pt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Role"
              value={roleFormData.role}
              onChange={(event) =>
                handleRoleFormChange('role', event.target.value)
              }
              required
            />
            <TextField
              label="Description"
              value={roleFormData.description}
              onChange={(event) =>
                handleRoleFormChange('description', event.target.value)
              }
              required
              multiline
              minRows={2}
            />
            <Autocomplete
              multiple
              options={permissionsList}
              value={roleFormData.permissions}
              onChange={(_, value) =>
                handleRoleFormChange('permissions', value)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Permissions"
                  required
                  helperText="Choose one or more permissions for this role"
                />
              )}
            />
            <FormControlLabel
              label={roleFormData.isActive ? 'Active' : 'Inactive'}
              control={
                <Switch
                  color={roleFormData.isActive ? 'success' : 'default'}
                  checked={roleFormData.isActive}
                  onChange={(event) =>
                    handleRoleFormChange('isActive', event.target.checked)
                  }
                />
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Box>
            {selectedRole && (
              <Button
                color="error"
                onClick={() => handleDeleteRole(selectedRole)}
                disabled={roleSubmitting || deletingRoleId === selectedRole.id}
              >
                {deletingRoleId === selectedRole.id ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <Button onClick={handleCloseRoleDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitRole}
              disabled={roleSubmitting || !isRoleFormValid}
            >
              {roleSubmitting
                ? selectedRole
                  ? 'Updating...'
                  : 'Creating...'
                : selectedRole
                ? 'Save Changes'
                : 'Create Role'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCloseConfirmDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete role "{roleToDelete?.role}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteRole}
            disabled={deletingRoleId !== null}
          >
            {deletingRoleId !== null ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteUserOpen}
        onClose={handleCloseConfirmDeleteUser}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{userToDelete?.username}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDeleteUser}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteUser}
            disabled={deletingUserId !== null}
          >
            {deletingUserId !== null ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
