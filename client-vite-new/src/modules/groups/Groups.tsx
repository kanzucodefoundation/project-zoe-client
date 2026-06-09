import { useState, useEffect } from 'react';
import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { styled, alpha } from '@mui/material/styles';
import { get } from '../../utils/ajax';
import {
  remoteRoutes,
  localRoutes,
  appPermissions,
} from '../../data/constants';
import type { RootState } from '../../data/store';
import { hasAnyCapability } from '../../utils/permissions';
import AddGroupDialog from './AddGroupDialog';
import type { GroupNode } from './types';

// Styled TreeItem with dashed border for hierarchy visualization
const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  '& .MuiTreeItem-content': {
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.16),
      },
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
  },
  '& .MuiTreeItem-groupTransition': {
    marginLeft: 16,
    paddingLeft: 12,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.3)}`,
  },
}));

interface TreeLabelProps {
  name: string;
  hasChildren: boolean;
  onViewDetails: (e: React.MouseEvent) => void;
  onAddChild: (e: React.MouseEvent) => void;
  showAddChildAction: boolean;
}

const TreeLabel = ({
  name,
  hasChildren,
  onViewDetails,
  onAddChild,
  showAddChildAction,
}: TreeLabelProps) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    width="100%"
    py={0.5}
  >
    <Box
      display="flex"
      alignItems="center"
      flexGrow={1}
      onClick={onViewDetails}
      sx={{ cursor: 'pointer' }}
    >
      <Typography variant="body1" fontWeight={hasChildren ? 500 : 400}>
        {name}
      </Typography>
    </Box>
    <Box display="flex" gap={0.5} onClick={(e) => e.stopPropagation()}>
      <IconButton
        size="small"
        onClick={onViewDetails}
        title="View Details"
        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
      {showAddChildAction ? (
        <IconButton
          size="small"
          color="primary"
          onClick={onAddChild}
          title="Add Child Group"
          sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      ) : null}
    </Box>
  </Box>
);

const Groups = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);

  const [groups, setGroups] = useState<GroupNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<GroupNode | null>(null);
  const canViewGroupEditActions = hasAnyCapability(user, [
    appPermissions.roleGroupEdit,
  ]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = () => {
    setLoading(true);
    get(
      remoteRoutes.groups,
      (response: GroupNode[]) => {
        const data = Array.isArray(response) ? response : [];
        console.log('Groups tree data:', data);
        console.log('Root groups:', data.length);
        const withChildren = data.filter(
          (g) => g.children && g.children.length > 0,
        );
        console.log('Root groups with children:', withChildren.length);

        setGroups(data);
        // Auto-expand root level items that have children
        const rootIds = data
          .filter((g) => g.children && g.children.length > 0)
          .map((g) => String(g.id));
        setExpandedItems(rootIds);
        setLoading(false);
      },
      (error: any) => {
        console.error('Failed to fetch groups:', error);
        toast.error('Failed to load groups');
        setGroups([]);
        setLoading(false);
      },
    );
  };

  const handleViewDetails = (group: GroupNode) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`${localRoutes.groups}/${group.id}`);
  };

  const handleAddChild = (parentGroup: GroupNode) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canViewGroupEditActions) {
      return;
    }
    setSelectedParent(parentGroup);
    setDialogOpen(true);
  };

  const handleAddRootGroup = () => {
    if (!canViewGroupEditActions) {
      return;
    }
    setSelectedParent(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedParent(null);
  };

  const handleDialogSuccess = () => {
    fetchGroups();
  };

  const handleExpandedItemsChange = (
    _event: React.SyntheticEvent | null,
    itemIds: string[],
  ) => {
    setExpandedItems(itemIds);
  };

  const renderTreeItems = (nodes: GroupNode[]): React.ReactNode => {
    return nodes.map((node) => (
      <StyledTreeItem
        key={node.id}
        itemId={String(node.id)}
        label={
          <TreeLabel
            name={node.name}
            hasChildren={node.children && node.children.length > 0}
            onViewDetails={handleViewDetails(node)}
            onAddChild={handleAddChild(node)}
            showAddChildAction={canViewGroupEditActions}
          />
        }
      >
        {node.children && node.children.length > 0
          ? renderTreeItems(node.children)
          : null}
      </StyledTreeItem>
    ));
  };

  const countTotalGroups = (nodes: GroupNode[]): number => {
    return nodes.reduce((count, node) => {
      return count + 1 + (node.children ? countTotalGroups(node.children) : 0);
    }, 0);
  };

  const totalGroups = countTotalGroups(groups);

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h4">Groups</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? 'Loading groups...'
              : `${totalGroups} groups in your organization`}
          </Typography>
        </Box>
        {canViewGroupEditActions ? (
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRootGroup}
            >
              Add Group
            </Button>
          </Box>
        ) : null}
      </Box>

      {/* Tree View */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : groups.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            {canViewGroupEditActions
              ? 'No groups found. Create your first group to get started.'
              : 'No groups found.'}
          </Typography>
        </Box>
      ) : (
        <Paper sx={{ p: 2 }}>
          <SimpleTreeView
            expandedItems={expandedItems}
            onExpandedItemsChange={handleExpandedItemsChange}
            slots={{
              collapseIcon: ExpandMoreIcon,
              expandIcon: ChevronRightIcon,
            }}
            sx={{
              '& .MuiTreeItem-root': {
                '&:not(:last-child)': {
                  marginBottom: 0.5,
                },
              },
            }}
          >
            {renderTreeItems(groups)}
          </SimpleTreeView>
        </Paper>
      )}

      {/* Add Group Dialog */}
      <AddGroupDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        parentGroup={selectedParent}
      />
    </Container>
  );
};

export default Groups;
