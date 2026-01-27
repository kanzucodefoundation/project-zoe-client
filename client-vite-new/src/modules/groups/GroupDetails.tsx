import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, del } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import AddGroupDialog from './AddGroupDialog';
import type { GroupNode } from './types';

interface GroupDetail {
  id: number;
  name: string;
  privacy: string;
  details: string | null;
  parentId: number | null;
  categoryId: number | null;
  category?: { id: number; name: string };
  parent?: { id: number; name: string };
  address?: { name: string; placeId: string } | null;
  children: GroupNode[];
}

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchGroup = () => {
    if (!groupId) return;

    setLoading(true);
    get(
      `${remoteRoutes.groups}/${groupId}`,
      (data: GroupDetail) => {
        setGroup(data);
        setLoading(false);
      },
      (error: any) => {
        console.error('Failed to fetch group:', error);
        toast.error('Failed to load group details');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

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
      (error: any) => {
        console.error('Failed to delete group:', error);
        toast.error('Failed to delete group');
        setDeleting(false);
      }
    );
  };

  const handleEditSuccess = () => {
    fetchGroup();
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
    parentId: group.parentId,
    address: group.address?.name || null,
    categoryId: group.category?.id,
    children: group.children || [],
  };

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
              <Chip label={group.category.name} size="small" variant="outlined" />
            )}
          </Box>
        </Box>
        <Box display="flex" gap={1}>
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
              Parent Group
            </Typography>
            <Typography variant="body1">
              {group.parent?.name || '-'}
            </Typography>
          </Box>

          {group.address?.name && (
            <Box gridColumn="1 / -1">
              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1">{group.address.name}</Typography>
            </Box>
          )}

          <Box gridColumn="1 / -1">
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {group.details || '-'}
            </Typography>
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
                  <Typography>{child.name}</Typography>
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

      {/* Edit Dialog */}
      <AddGroupDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        editGroup={groupAsNode}
      />
    </Container>
  );
};

export default GroupDetails;
