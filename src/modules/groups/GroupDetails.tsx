import { useState, useEffect, useCallback, useRef } from 'react';
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
  Collapse,
  Avatar,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmsRounded as SmsIcon,
  PersonAdd as PersonAddIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Close as CloseIcon,
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
import ConfirmDialog from '../../components/ui/ConfirmDialog';

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

type ContactsResponse = ContactRef[] | { data: ContactRef[] };

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

interface CollapsibleSectionProps {
  title: string;
  /** Shown beside the title, so the size of a section is known while closed. */
  count?: number;
  /** Controls for this section. Clicking them never toggles the section. */
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

const CollapsibleSection = ({
  title,
  count,
  actions,
  sx,
  children,
}: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((current) => !current);

  return (
    <Paper sx={{ p: 3, ...sx }}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Typography variant="h6">{title}</Typography>
        {count !== undefined && (
          <Chip label={count} size="small" variant="outlined" />
        )}

        <Box
          sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}
          onClick={(event) => event.stopPropagation()}
        >
          {actions}
          <IconButton
            size="small"
            onClick={toggle}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${title}`}
          >
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 2 }} />
        {children}
      </Collapse>
    </Paper>
  );
};

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const membershipsRequestIdRef = useRef(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [updatingMembershipId, setUpdatingMembershipId] = useState<
    number | null
  >(null);
  const [submittingMember, setSubmittingMember] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [allMemberships, setAllMemberships] = useState<GroupMembership[] | null>(
    null,
  );
  const [searchingAll, setSearchingAll] = useState(false);
  const [allContacts, setAllContacts] = useState<ContactRef[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactRef[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100); 
  const [total, setTotal] = useState(0); 

  useEffect(() => {
    setPage(0);
  }, [groupId]);

  useEffect(() => {
    if (!showAddMemberForm) return;
    let ignore = false;
    const fetchAllContacts = async () => {
      setContactsLoading(true);
      try {
        const accumulatedContacts: ContactRef[] = [];
        let skip = 0;
        const limit = 100;
        let keepFetching = true;
        let loopCount = 0;
        const MAX_LOOPS = 200;
        while (keepFetching && !ignore && loopCount < MAX_LOOPS) {
          loopCount++;
          const url = `${remoteRoutes.contacts}?skip=${skip}&limit=${limit}`;
          const response = await getJson<ContactsResponse>(url);
          const data = response && !Array.isArray(response) && 'data' in response 
            ? response.data 
            : response;
          if (!Array.isArray(data) || data.length === 0) {
            keepFetching = false;
            break;
          }
          accumulatedContacts.push(...data);
          skip += limit;
          if (data.length < limit) {
            keepFetching = false;
          }
        }
        if (!ignore && keepFetching && loopCount === MAX_LOOPS) {
          console.warn(`[Pagination Guard] Reached maximum request cap of ${MAX_LOOPS}. Data may be truncated.`);
          toast.warning(
            `Loaded the first ${accumulatedContacts.length} people. The list may be incomplete — try searching for a specific name if you don't see who you're looking for.`,
          );
        }
        if (!ignore) setAllContacts(accumulatedContacts);
      } catch {
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
    const requestId = ++membershipsRequestIdRef.current;
    setMembershipsLoading(true);
    try {
      const currentSkip = page * rowsPerPage;
      const response = await getJson<{
        data: GroupMembership[];
        total: number;
      }>(
        `${remoteRoutes.groupsMembership}?groupId=${encodeURIComponent(
          groupId,
        )}&limit=${rowsPerPage}&skip=${currentSkip}`,
      );
      if (requestId !== membershipsRequestIdRef.current) return;
      const membershipList = Array.isArray(response?.data) ? response.data : [];
      const activeMemberships = membershipList.filter(
        (membership) => membership.isActive !== false,
      );
      setMemberships(activeMemberships);
      setTotal(response?.total ?? 0);
      setAllMemberships(null);
    } catch (error: unknown) {
      if (requestId !== membershipsRequestIdRef.current) return;
      console.error('Failed to fetch memberships:', error);
      toast.error('Failed to load group members');
    } finally {
      if (requestId === membershipsRequestIdRef.current) {
        setMembershipsLoading(false);
      }
    }
  }, [groupId, page, rowsPerPage]);

  // Searching has to reach the whole group, not just the page in view, so
  // the first search pages the membership list in full and reuses it after.
  // Keyed on whether a search is active, not on the text: depending on the
  // text restarts the whole load on every keystroke.
  const hasMemberSearch = memberSearch.trim() !== '';

  useEffect(() => {
    if (!groupId || !hasMemberSearch || allMemberships) return;
    let ignore = false;

    const loadEveryMember = async () => {
      setSearchingAll(true);
      try {
        const collected: GroupMembership[] = [];
        const limit = 100;
        const MAX_PAGES = 200;
        for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
          // Abandoned searches stop paging instead of running to MAX_PAGES.
          if (ignore) return;
          const response = await getJson<{ data: GroupMembership[] }>(
            `${remoteRoutes.groupsMembership}?groupId=${encodeURIComponent(
              groupId,
            )}&limit=${limit}&skip=${pageIndex * limit}`,
          );
          const batch = Array.isArray(response?.data) ? response.data : [];
          collected.push(...batch);
          if (batch.length < limit) break;
        }
        if (!ignore) {
          setAllMemberships(
            collected.filter((m) => m.isActive !== false),
          );
        }
      } catch {
        // The page already in view stays searchable; nothing else changes.
        if (!ignore) setAllMemberships(null);
      } finally {
        if (!ignore) setSearchingAll(false);
      }
    };

    loadEveryMember();
    return () => {
      ignore = true;
      // The abandoned run can no longer clear this, so the cleanup does;
      // otherwise the spinner replaces the clear button for good.
      setSearchingAll(false);
    };
  }, [groupId, hasMemberSearch, allMemberships]);

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

      // Both lists, or a role changed from the search results would keep
      // showing the old one and the next click would resend the same role.
      const applyRoleChange = (list: GroupMembership[]) =>
        list.map((currentMembership) =>
          currentMembership.id === membership.id
            ? {
                ...currentMembership,
                ...updatedMembership,
                role: updatedMembership.role || nextRole,
              }
            : currentMembership,
        );

      setMemberships(applyRoleChange);
      setAllMemberships((current) =>
        current ? applyRoleChange(current) : current,
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

    setConfirmDelete(false);
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
      <Container>
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container>
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

  // With a term, search the whole group; without one, show the page in view.
  const searchTerm = memberSearch.trim().toLowerCase();
  const visibleMemberships = searchTerm
    ? (allMemberships ?? memberships).filter((m) =>
        (m.contact?.name || `Contact #${m.contactId}`)
          .toLowerCase()
          .includes(searchTerm),
      )
    : memberships;
  return (
    <Container>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
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
        <Box sx={{display:"flex", gap:"1rem", flexWrap:"wrap"}} >
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
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : null}
        </Box>
      </Box>

      <CollapsibleSection title="Details">

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

      </CollapsibleSection>

      {group.children && group.children.length > 0 && (
        <CollapsibleSection
          title="Child Groups"
          count={group.children.length}
          sx={{ mt: 3 }}
        >
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
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="People in this Group"
        count={!membershipsLoading && total > 0 ? total : undefined}
        sx={{ mt: 3 }}
        actions={
          canManageCurrentGroup ? (
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
          ) : null
        }
      >
        {showAddMemberForm && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Add people to this group
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 2 }}
            >
              Search by name and pick as many as you need. People already in the
              group cannot be selected twice.
            </Typography>

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
                const alreadyMember = isMember(option.id);
                const { key, ...rest } = props as typeof props & { key: string };
                return (
                  <Box
                    component="li"
                    key={key}
                    {...rest}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                      {(option.name || '?').charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                      {option.name}
                    </Typography>
                    {alreadyMember && (
                      <Chip label="Already in group" size="small" />
                    )}
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search people"
                  placeholder="Start typing a name"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {contactsLoading ? (
                          <CircularProgress color="inherit" size={18} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                mt: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {selectedContacts.length === 0
                  ? 'Nobody selected yet'
                  : `${selectedContacts.length} selected`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => {
                    setShowAddMemberForm(false);
                    setSelectedContacts([]);
                  }}
                  disabled={submittingMember}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleBulkAddMembers}
                  disabled={submittingMember || selectedContacts.length === 0}
                  startIcon={
                    submittingMember ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <PersonAddIcon />
                    )
                  }
                >
                  {submittingMember ? 'Adding…' : 'Add to group'}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* The memberships endpoint takes only groupId, limit and skip, so
            this filters what is loaded rather than searching the group. The
            wording and the note below say so rather than implying otherwise. */}
        <TextField
          size="small"
          fullWidth
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          placeholder="Search people in this group"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchingAll ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : memberSearch ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setMemberSearch('')}
                  aria-label="Clear search"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {membershipsLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            {visibleMemberships.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {memberSearch
                  ? `Nobody in this group matches "${memberSearch}".`
                  : 'No group members assigned yet.'}
              </Typography>
            ) : (
              visibleMemberships.map((membership) => (
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
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' }, 
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
                    onClick={() => navigate(`${localRoutes.contacts}/${membership.contactId || membership.contact?.id}`)}
                  >
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ 
                        minWidth: 0,
                        fontWeight: 500,
                      }}
                    >
                      {membership.contact?.name || `Contact #${membership.contactId}`}
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
                      sx={
                        getMembershipRole(membership) === 'Leader'
                          ? {
                              bgcolor: 'primary.main',
                              borderColor: 'primary.main',
                              '& .MuiChip-label': {
                                color: 'primary.contrastText',
                              },
                            }
                          : undefined
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
          </Box>
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
              />
          </Box>
        </Box>
      </CollapsibleSection>

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
      <ConfirmDialog
        open={confirmDelete}
        title="Delete group"
        message={
          <>
            Delete <strong>{group?.name}</strong>? Members are not deleted, but
            they lose their place in this group.
          </>
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />

    </Container>
  );
};

export default GroupDetails;
