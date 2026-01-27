import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { toast } from 'react-toastify';
import { get, post, put } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { GroupPrivacy } from './types';
import type { GroupNode, IGroupCategory } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentGroup?: GroupNode | null;
  editGroup?: GroupNode | null;
}

interface ComboOption {
  id: number;
  name: string;
}

const AddGroupDialog = ({ open, onClose, onSuccess, parentGroup, editGroup }: Props) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<GroupPrivacy>(GroupPrivacy.Private);
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<ComboOption | null>(null);
  const [parent, setParent] = useState<ComboOption | null>(null);
  const [categories, setCategories] = useState<IGroupCategory[]>([]);
  const [groups, setGroups] = useState<ComboOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const isEditing = !!editGroup;

  useEffect(() => {
    if (open) {
      // Fetch categories and groups for selection
      setLoadingData(true);
      Promise.all([
        new Promise<IGroupCategory[]>((resolve) => {
          get(
            remoteRoutes.groupsCategories,
            (data: IGroupCategory[]) => resolve(data),
            () => resolve([])
          );
        }),
        new Promise<ComboOption[]>((resolve) => {
          get(
            remoteRoutes.groupsCombo,
            (data: ComboOption[]) => resolve(data),
            () => resolve([])
          );
        }),
      ]).then(([categoriesData, groupsData]) => {
        setCategories(categoriesData);
        setGroups(groupsData);
        setLoadingData(false);
      });

      // Pre-fill form if editing
      if (editGroup) {
        setName(editGroup.name);
        setPrivacy(editGroup.privacy as GroupPrivacy || GroupPrivacy.Private);
        setDetails(editGroup.details || '');
        // Category and parent will be set after data is loaded
      } else {
        // Reset form for new group
        setName('');
        setPrivacy(GroupPrivacy.Private);
        setDetails('');
        setCategory(null);
      }
    }
  }, [open, editGroup]);

  // Set parent and category after data loads
  useEffect(() => {
    if (!loadingData && open) {
      if (editGroup) {
        // Set category from editGroup
        if (editGroup.categoryId) {
          const cat = categories.find(c => c.id === editGroup.categoryId);
          setCategory(cat || null);
        }
        // Set parent from editGroup
        if (editGroup.parentId) {
          const par = groups.find(g => g.id === editGroup.parentId);
          setParent(par || null);
        } else {
          setParent(null);
        }
      } else if (parentGroup) {
        // Pre-select parent for "Add Child" action
        const par = groups.find(g => g.id === parentGroup.id);
        setParent(par || null);
      } else {
        setParent(null);
      }
    }
  }, [loadingData, open, editGroup, parentGroup, categories, groups]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!category) {
      toast.error('Category is required');
      return;
    }

    setLoading(true);
    const payload = {
      id: editGroup?.id,
      name: name.trim(),
      privacy,
      details: details.trim(),
      categoryId: category.id,
      categoryName: category.name,
      parentId: parent?.id || null,
    };

    const request = isEditing ? put : post;
    const url = isEditing ? `${remoteRoutes.groups}/${editGroup!.id}` : remoteRoutes.groups;

    request(
      url,
      payload,
      () => {
        toast.success(isEditing ? 'Group updated successfully' : 'Group created successfully');
        setLoading(false);
        onSuccess();
        handleClose();
      },
      (error: any) => {
        console.error('Failed to save group:', error);
        toast.error(isEditing ? 'Failed to update group' : 'Failed to create group');
        setLoading(false);
      }
    );
  };

  const handleClose = () => {
    setName('');
    setPrivacy(GroupPrivacy.Private);
    setDetails('');
    setCategory(null);
    setParent(null);
    onClose();
  };

  const dialogTitle = isEditing
    ? `Edit Group: ${editGroup?.name}`
    : parentGroup
    ? `Add Group Under "${parentGroup.name}"`
    : 'Add New Group';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        {loadingData ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            <FormControl fullWidth required>
              <InputLabel>Privacy</InputLabel>
              <Select
                value={privacy}
                label="Privacy"
                onChange={(e) => setPrivacy(e.target.value as GroupPrivacy)}
              >
                <MenuItem value={GroupPrivacy.Private}>Private</MenuItem>
                <MenuItem value={GroupPrivacy.Public}>Public</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.name}
              value={category}
              onChange={(_, newValue) => setCategory(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Category" required />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Autocomplete
              options={groups}
              getOptionLabel={(option) => option.name}
              value={parent}
              onChange={(_, newValue) => setParent(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Parent Group" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <TextField
              label="Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingData}
        >
          {loading ? <CircularProgress size={24} /> : isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGroupDialog;
