import { useState, useEffect, useCallback } from 'react';
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
  Menu,
  MenuItem,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { get } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';

interface GroupItem {
  id: number;
  name: string;
  categoryName?: string;
  childCount?: number;
  memberCount?: number;
  parentId?: number | null;
}

interface BreadcrumbItem {
  id: number | null;
  name: string;
  categoryName?: string;
}

const Groups = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [cache, setCache] = useState<Record<string, GroupItem[]>>({});

  // Actions menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  const getCacheKey = (parentId: number | null) => parentId === null ? 'root' : String(parentId);

  const fetchGroups = useCallback((parentId: number | null) => {
    const cacheKey = getCacheKey(parentId);
    const cached = cache[cacheKey];
    if (cached) {
      setGroups(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    const parentParam = parentId !== null ? String(parentId) : 'null';
    const url = `${remoteRoutes.authServer}/api/groups?parentId=${parentParam}&limit=100`;

    get(
      url,
      (response: any) => {
        const data: GroupItem[] = Array.isArray(response) ? response : [];
        setGroups(data);
        setCache((prev) => ({ ...prev, [cacheKey]: data }));
        setLoading(false);
      },
      (error: any) => {
        console.error('Failed to fetch groups:', error);
        toast.error('Failed to load groups');
        setGroups([]);
        setLoading(false);
      },
    );
  }, [cache]);

  useEffect(() => {
    fetchGroups(null);
  }, []);

  const handleGroupClick = (group: GroupItem) => {
    setBreadcrumbs((prev) => [...prev, { id: group.id, name: group.name, categoryName: group.categoryName }]);
    setCurrentParentId(group.id);
    setSearchTerm('');
    fetchGroups(group.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setBreadcrumbs([]);
      setCurrentParentId(null);
      fetchGroups(null);
    } else {
      const target = breadcrumbs[index];
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      setCurrentParentId(target.id);
      fetchGroups(target.id);
    }
    setSearchTerm('');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, group: GroupItem) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const handleViewDetails = () => {
    if (selectedGroup) {
      navigate(`${localRoutes.groups}/${selectedGroup.id}`);
    }
    handleMenuClose();
  };

  const filteredGroups = searchTerm
    ? groups.filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : groups;

  const currentParentName = breadcrumbs.length > 0
    ? breadcrumbs[breadcrumbs.length - 1].name
    : null;

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4">Groups</Typography>
          <Typography variant="body2" color="text.secondary">
            {currentParentName
              ? `Viewing children of ${currentParentName}`
              : 'Browse your organization\'s groups'}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => toast.info('Add group coming soon')}
          >
            Add Group
          </Button>
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link
          component="button"
          underline="hover"
          color={breadcrumbs.length === 0 ? 'text.primary' : 'inherit'}
          onClick={() => handleBreadcrumbClick(-1)}
          sx={{ fontWeight: breadcrumbs.length === 0 ? 'bold' : 'normal', cursor: 'pointer' }}
        >
          Groups
        </Link>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast ? (
            <Typography key={crumb.id} color="text.primary" fontWeight="bold">
              {crumb.name}
            </Typography>
          ) : (
            <Link
              key={crumb.id}
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => handleBreadcrumbClick(index)}
              sx={{ cursor: 'pointer' }}
            >
              {crumb.name}
            </Link>
          );
        })}
      </Breadcrumbs>

      {/* Search */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Search groups at this level..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          size="small"
        />
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : filteredGroups.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            {searchTerm ? 'No groups match your search' : 'No groups found at this level'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Groups</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Members</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow
                  key={group.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleGroupClick(group)}
                >
                  <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold', color: 'primary.main' }}>
                    {group.name}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {group.categoryName || '-'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {(group.childCount ?? 0) > 0 ? `${group.childCount} groups` : '-'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {(group.memberCount ?? 0) > 0 ? `${group.memberCount} members` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, group)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
    </Container>
  );
};

export default Groups;
