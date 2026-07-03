import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Autocomplete,
  TextField,
  TablePagination,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmsRounded as SmsIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, del, put , post} from '../../utils/ajax';
import {
  remoteRoutes,
  localRoutes,
  appPermissions
} from '../../data/constants';
import type { RootState } from '../../data/store';
import { hasAnyCapability } from '../../utils/permissions';
import AddGroupDialog from './AddGroupDialog';
import MessageGroupModal from './MessageGroupModal';
import type { GroupNode } from './types';

interface GroupRef {
  id: number;
  name: string;
}

interface ContactRef {
  id: number;
  name: string;
}

interface GroupAddress {
  name?: string;
  placeId?: string;
  country?: string;
  district?: string;
  freeForm?: string;
}

interface GroupMembership {
  id: number;
  groupId: number;
  contactId: number;
  role?: string;
  joinedAt?: string;
  leftAt?: string | null;
  isActive?: boolean;
  isInferred?: boolean;
  group?: GroupRef;
  category?: GroupRef;
  contact?: GroupRef;
}

interface GroupDetail {
  id: number;
  name: string;
  privacy: string;
  details: string | null;
  parentId: number | null;
  categoryId: number | null;
  category?: GroupRef;
  parent?: GroupRef;
  address?: GroupAddress | null;
  leaders?: number[];
  canEditGroup?: boolean;
  children: GroupNode[];
}

type RawChild = number | RawGroupNode;

interface RawGroupNode {
  id?: number;
  name?: string;
  privacy?: string;
  details?: string | null;
  metaData?: string | null;
  parentId?: number | null;
  address?: GroupNode['address'];
  categoryId?: number;
  category?: GroupNode['category'];
  parent?: GroupNode['parent'];
  children?: RawGroupNode[];
  group?: RawGroupNode;
  child?: RawGroupNode;
}

interface RawGroupDetail extends Omit<GroupDetail, 'children'> {
  children?: RawChild[];
  parents?: number[];
}

type ManagedGroup =
  | number
  | string
  | { id?: number | string; groupId?: number | string };

const getJson = <T,>(url: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    get(
      url,
      (data) => resolve(data as T),
      (error) => reject(error),
    );
  });

const putJson = <T,>(url: string, values: unknown): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    put(
      url,
      values,
      (data) => resolve(data as T),
      (error) => reject(error),
    );
  });

const normalizeGroupNode = (
  value: RawGroupNode,
  children: GroupNode[] = [],
): GroupNode => {
  const nested = value.group || value.child;
  const source = nested || value;

  return {
    id: source.id || 0,
    name: source.name || '',
    privacy: source.privacy || 'Private',
    details: source.details || null,
    metaData: source.metaData || null,
    parentId: source.parentId ?? null,
    address: source.address || null,
    categoryId: source.categoryId ?? source.category?.id,
    category: source.category || null,
    parent: source.parent || null,
    children,
  };
};

const resolveChildNode = async (child: RawChild): Promise<GroupNode> => {
  if (typeof child === 'number') {
    const data = await getJson<RawGroupNode>(`${remoteRoutes.groups}/${child}`);
    return normalizeGroupNode(data);
  }

  const nestedChildren = Array.isArray(child.children)
    ? await Promise.all(
        child.children.map((nestedChild) => {
          if (typeof nestedChild === 'number') {
            return resolveChildNode(nestedChild);
          }
          return Promise.resolve(normalizeGroupNode(nestedChild));
        }),
      )
    : [];

  return normalizeGroupNode(child, nestedChildren);
};

const normalizeGroupDetail = async (
  value: RawGroupDetail,
): Promise<GroupDetail> => ({
  ...value,
  children: Array.isArray(value.children)
    ? await Promise.all(
        value.children
          .filter((child) => {
            if (typeof child === 'number') {
              return child !== value.id;
            }
            return (
              (child.group?.id || child.child?.id || child.id) !== value.id
            );
          })
          .map(resolveChildNode),
      )
    : [],
});

const getAddressLabel = (address?: GroupAddress | null) => {
  if (!address) {
    return null;
  }

  if (address.name) {
    return address.name;
  }

  const parts = [address.freeForm, address.district, address.country].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(', ') : null;
};

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingMembershipId, setUpdatingMembershipId] = useState<
    number | null
  >(null);
  const [submittingMember, setSubmittingMember] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [allContacts, setAllContacts] = useState<ContactRef[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactRef[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100); 
  const [total, setTotal] = useState(0); 

  useEffect(() => {
    if (!showAddMemberForm) return;
    let ignore = false;
    const fetchAllContacts = async () => {
      setContactsLoading(true);
      try {
        const data = await getJson<ContactRef[]>(remoteRoutes.contactsPeopleCombo);
        if (!ignore) setAllContacts(Array.isArray(data) ? data : []);
      } catch{
        if (!ignore) toast.error('Failed to load people for selection.');
      } finally {
        if (!ignore) setContactsLoading(false);
      }
    };
    fetchAllContacts();
    return () => { ignore = true; };
  }, [showAddMemberForm]);
  const handleBulkAddMembers = async () => {
    if (!groupId || selectedContacts.length === 0) return;
    setSubmittingMember(true);
    const memberIds = selectedContacts.map((contact) => contact.id);
    const payload = {
      groupId: Number(groupId),
      members: memberIds, 
      role: 'Member'  
    };
    post(
      `${remoteRoutes.groupsMembership}`,
      payload,
      (response: { message?: string }) => {
        toast.success(response?.message || `Successfully added ${selectedContacts.length} members`);
        setSelectedContacts([]);
        setShowAddMemberForm(false);
        fetchMemberships(); 
        setSubmittingMember(false);
      },
      () => {
        toast.error('Could not save selection to the database');
        setSubmittingMember(false);
      }
    );
  };

  const isLeaderMembership = (membership: GroupMembership) =>
    membership.role === 'Leader' ||
    (!membership.role && group?.leaders?.includes(membership.contactId));
  const getMembershipRole = (membership: GroupMembership) =>
    isLeaderMembership(membership) ? 'Leader' : membership.role || 'Member';

  const canManageCurrentGroup = (() => {
    if (!group) {
      return false;
    }

    const manageableGroups: ManagedGroup[] = Array.isArray(
      user?.canManageGroups,
    )
      ? user.canManageGroups
      : [];
    const hasManagedGroup = manageableGroups.some((managedGroup) => {
      if (
        typeof managedGroup === 'number' ||
        typeof managedGroup === 'string'
      ) {
        return `${managedGroup}` === `${group.id}`;
      }

      return (
        `${managedGroup?.id ?? managedGroup?.groupId ?? ''}` === `${group.id}`
      );
    });

    return Boolean(group.canEditGroup || hasManagedGroup);
  })();
  const canViewGroupEditActions = hasAnyCapability(user, [
    appPermissions.roleGroupEdit,
  ]);

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    try {
      const data = await getJson<RawGroupDetail>(
        `${remoteRoutes.groups}/${groupId}`,
      );
      const normalizedGroup = await normalizeGroupDetail(data);
      setGroup(normalizedGroup);
    } catch (error: unknown) {
      console.error('Failed to fetch group:', error);
      toast.error('Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

   const fetchMemberships = useCallback(async () => {
    if (!groupId) return;

    setMembershipsLoading(true);
    try {
      const currentSkip = page * rowsPerPage;      
      const data = await getJson<GroupMembership | GroupMembership[]>(
        `${remoteRoutes.groupsMembership}?groupId=${encodeURIComponent(
          groupId,
        )}&limit=${rowsPerPage}&skip=${currentSkip}`, 
      );
      const membershipList = Array.isArray(data)
        ? data
        : data
        ? [data as GroupMembership]
        : [];
      const activeMemberships = membershipList.filter(
        (membership) => membership.isActive !== false,
      );
      setMemberships(activeMemberships);
      if (membershipList.length < rowsPerPage) {
        setTotal(currentSkip + membershipList.length);
      } else {
        setTotal(currentSkip + membershipList.length + 1); 
      }
    } catch (error: unknown) {
      console.error('Failed to fetch memberships:', error);
      toast.error('Failed to load group members');
    } finally {
      setMembershipsLoading(false);
    }  }, [groupId, page, rowsPerPage]); 
    
    useEffect(() => {
      fetchGroup();
    }, [fetchGroup]);
    useEffect(() => {    
      fetchMemberships();
    }, [fetchMemberships]);

  const handleRoleToggle = async (membership: GroupMembership) => {
    const nextRole =
      getMembershipRole(membership) === 'Leader' ? 'Member' : 'Leader';

    setUpdatingMembershipId(membership.id);
    try {
      const updatedMembership = await putJson<GroupMembership>(
        remoteRoutes.groupsMembership,
        {
          ...membership,
          role: nextRole,
        },
      );

      setMemberships((currentMemberships) =>
        currentMemberships.map((currentMembership) =>
          currentMembership.id === membership.id
            ? {
                ...currentMembership,
                ...updatedMembership,
                role: updatedMembership.role || nextRole,
              }
            : currentMembership,
        ),
      );

      toast.success(
        `${
          membership.contact?.name || 'Member'
        } is now a ${nextRole.toLowerCase()}`,
      );
    } catch (error: unknown) {
      console.error('Failed to update membership role:', error);
      toast.error('Failed to update member role');
    } finally {
      setUpdatingMembershipId(null);
    }
  };

  const handleDelete = () => {
    if (!group) return;

    if (!window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      return;
    }

    setDeleting(true);
    del(
      `${remoteRoutes.groups}/${group.id}`,
      () => {
        toast.success('Group deleted successfully');
        navigate(localRoutes.groups);
      },
      (error: unknown) => {
        console.error('Failed to delete group:', error);
        toast.error('Failed to delete group');
        setDeleting(false);
      },
    );
  };

  const handleEditSuccess = () => {
    fetchGroup();
    fetchMemberships();
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

  if (!group) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">Group not found</Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(localRoutes.groups)}
            sx={{ mt: 2 }}
          >
            Back to Groups
          </Button>
        </Box>
      </Container>
    );
  }

  // Convert group to GroupNode format for the edit dialog
  const groupAsNode: GroupNode = {
    id: group.id,
    name: group.name,
    privacy: group.privacy,
    details: group.details,
    metaData: null,
    parentId: group.parentId ?? group.parent?.id ?? null,
    address: group.address || null,
    categoryId: group.categoryId ?? group.category?.id,
    category: group.category || null,
    parent: group.parent || null,
    children: group.children || [],
  };
  const addressLabel = getAddressLabel(group.address);
  const isMember = (contactId: ContactRef['id']) =>
    memberships.some((m) => m.contactId === contactId);
  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate(localRoutes.groups)}>
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4">{group.name}</Typography>
          <Box display="flex" gap={1} mt={0.5}>
            <Chip
              label={group.privacy}
              size="small"
              color={group.privacy === 'Public' ? 'success' : 'default'}
            />
            {group.category && (
              <Chip
                label={group.category.name}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<SmsIcon />}
            onClick={() => setMessageModalOpen(true)}
          >
            Message Group
          </Button>
          {canViewGroupEditActions ? (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditDialogOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : null}
        </Box>
      </Box>

      {/* Details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">{group.name}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Privacy
            </Typography>
            <Typography variant="body1">{group.privacy}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1">
              {group.category?.name || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Group Id
            </Typography>
            <Typography variant="body1">{group.id ?? '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Parent Group
            </Typography>
            <Typography variant="body1">{group.parent?.name || '-'}</Typography>
          </Box>

          {addressLabel && (
            <Box gridColumn="1 / -1">
              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1">{addressLabel}</Typography>
            </Box>
          )}

          <Box gridColumn="1 / -1">
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">{group.details || '-'}</Typography>
          </Box>
        </Box>

        {/* Child Groups */}
        {group.children && group.children.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
              Child Groups ({group.children.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={1}>
              {group.children.map((child) => (
                <Box
                  key={child.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={1.5}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  onClick={() => navigate(`${localRoutes.groups}/${child.id}`)}
                >
                  <Typography>{child.name || 'Unnamed group'}</Typography>
                  <Chip
                    label={child.privacy}
                    size="small"
                    color={child.privacy === 'Public' ? 'success' : 'default'}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          flexWrap="wrap"
        >
          <Typography variant="h6" gutterBottom>
            People in this Group
          </Typography>   
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            padding={2}
          >
              {!membershipsLoading && memberships.length > 0 ? (
                <Chip
                  label={`${memberships.length} ${
                    memberships.length === 1 ? 'person' : 'people'
                  }`}
                  size="small"
                  variant="outlined"
                />
              ) : null}
              {canManageCurrentGroup && (
                <Button
                  startIcon={<PersonAddIcon />}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setShowAddMemberForm(!showAddMemberForm);
                    setSelectedContacts([]);
                  }}
                >
                  {showAddMemberForm ? 'Close' : 'Add Member'}
                </Button>
              )}               </Box> 
          
        </Box>        
        <Divider sx={{ mb: 2 }} />
        {showAddMemberForm && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Autocomplete<ContactRef, true, false, false>
                  multiple
                  options={allContacts}
                  loading={contactsLoading}
                  value={selectedContacts}
                  onChange={(_, newValue) => setSelectedContacts(newValue)}
                  getOptionLabel={(option: ContactRef) => option.name || ''}
                  isOptionEqualToValue={(option: ContactRef, value: ContactRef) =>
                    option.id === value.id
                  }
                  getOptionDisabled={(option: ContactRef) => isMember(option.id)}
                  renderOption={(props, option: ContactRef) => {
                    const isAlreadyMember = isMember(option.id);
                    return (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          color: isAlreadyMember ? 'text.disabled' : 'text.primary',
                          pointerEvents: isAlreadyMember ? 'none' : 'auto',
                        }}
                      >
                        {option.name} {isAlreadyMember && '(Already in Group)'}
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Type name to search members..."
                      variant="outlined"
                      placeholder="Select people..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {contactsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={handleBulkAddMembers}
                    disabled={submittingMember || selectedContacts.length === 0}
                  >
                    {submittingMember ? <CircularProgress size={24} /> : `Add Selected (${selectedContacts.length})`}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        {membershipsLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            {memberships.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No group members assigned yet.
              </Typography>
            ) : (
              memberships.map((membership) => (
                <Box
                  key={membership.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  gap={2}
                  p={1.5}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={1.5}
                    flexGrow={1}
                    width={{ xs: '100%', sm: 'auto' }}
                    minWidth={0}
                  >
                    <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
                      {membership.contact?.name ||
                        `Contact #${membership.contactId}`}
                    </Typography>
                    <Chip
                      label={getMembershipRole(membership)}
                      size="small"
                      color={
                        getMembershipRole(membership) === 'Leader'
                          ? 'primary'
                          : 'default'
                      }
                      variant={
                        getMembershipRole(membership) === 'Leader'
                          ? 'filled'
                          : 'outlined'
                      }
                    />               
                  </Box>

                  {canManageCurrentGroup ? (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={updatingMembershipId === membership.id}
                      onClick={() => handleRoleToggle(membership)}
                      sx={{
                        alignSelf: { xs: 'stretch', sm: 'center' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {updatingMembershipId === membership.id
                        ? 'Saving...'
                        : getMembershipRole(membership) === 'Leader'
                        ? 'Make Member'
                        : 'Make Leader'}
                    </Button>
                  ) : null}
                </Box>          
              ))
            )}
            <Box display="flex" justifyContent="center" mt={4} mb={2}>
              {/*   Pagination Section */}
              <Box
                display="flex"
                justifyContent={{ xs: 'center', sm: 'flex-end' }}
                mt={1}
                width="100%"
              >
                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    const newLimit = parseInt(e.target.value, 10);
                    setRowsPerPage(newLimit);
                    setPage(0); // Snap back to page 1 on limit adjustments
                  }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Edit Dialog */}
      <AddGroupDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        editGroup={groupAsNode}
      />

      {/* Message Group Modal */}
      <MessageGroupModal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        groupId={group.id}
        groupName={group.name}
      />
    </Container>
  );
};

export default GroupDetails;
