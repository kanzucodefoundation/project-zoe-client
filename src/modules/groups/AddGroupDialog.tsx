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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { toast } from 'react-toastify';
import { get, post, put } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { GroupPrivacy } from './types';
import type { GroupNode, IAddress, IGroupCategory } from './types';
import PlaceAutocomplete from './PlaceAutocomplete';

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

// Same shape as ContactForm's group option: carries the parent's name for display.
interface GroupOption extends ComboOption {
  parentName?: string;
}

// Hierarchical shape returned by remoteRoutes.groups (local to this component,
// mirrors ContactForm's local GroupNode used purely for flattening).
type GroupTreeNode = {
  id: number;
  name: string;
  children?: GroupTreeNode[];
};

const toComboOption = (
  value?: Pick<GroupNode, 'id' | 'name'> | GroupNode['parent'] | null,
): ComboOption | null => {
  if (!value?.id || !value?.name) {
    return null;
  }

  return {
    id: Number(value.id),
    name: value.name,
  };
};

// Flatten hierarchical groups, preserving parent name for display (same as ContactForm).
const flattenGroups = (
  nodes: GroupTreeNode[] | undefined,
  parentName?: string,
  excludeId?: number,
): GroupOption[] => {
  const out: GroupOption[] = [];
  for (const n of nodes || []) {
    if (n.id !== excludeId) {
      out.push({ id: n.id, name: n.name, parentName });
    }
    if (n.children?.length) {
      out.push(...flattenGroups(n.children, n.name, excludeId));
    }
  }
  return out;
};

const getGroupLabel = (option: GroupOption) =>
  option.parentName ? `${option.name} - ${option.parentName}` : option.name;

const AddGroupDialog = ({
  open,
  onClose,
  onSuccess,
  parentGroup,
  editGroup,
}: Props) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<GroupPrivacy>(GroupPrivacy.Private);
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<ComboOption | null>(null);
  const [parent, setParent] = useState<ComboOption | null>(null);
  const [address, setAddress] = useState<IAddress | null>(null);
  const [categories, setCategories] = useState<IGroupCategory[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const isEditing = !!editGroup;

  useEffect(() => {
    if (open) {
      // Fetch categories for selection
      setLoadingData(true);
      new Promise<IGroupCategory[]>((resolve) => {
        get(
          remoteRoutes.groupsCategories,
          (data: IGroupCategory[]) => resolve(data),
          () => resolve([]),
        );
      }).then((categoriesData) => {
        setCategories(categoriesData);
        setLoadingData(false);
      });

      // Pre-fill form if editing
      if (editGroup) {
        setName(editGroup.name);
        setPrivacy((editGroup.privacy as GroupPrivacy) || GroupPrivacy.Private);
        setDetails(editGroup.details || '');
        setAddress(editGroup.address || null);
        // Category and parent will be set after data is loaded
      } else {
        // Reset form for new group
        setName('');
        setPrivacy(GroupPrivacy.Private);
        setDetails('');
        setCategory(null);
        setParent(null);
        setAddress(null);
        setGroups([]);
      }
    }
  }, [open, editGroup]);

  // Set category after data loads
  useEffect(() => {
    if (!loadingData && open) {
      if (editGroup) {
        if (editGroup.categoryId) {
          const cat = categories.find((c) => c.id === editGroup.categoryId);
          setCategory(cat || null);
        }
      }
    }
  }, [loadingData, open, editGroup, categories]);

  // Fetch the full group hierarchy and flatten it, like ContactForm's Groups field.
  // Excludes the group currently being edited so it can't be its own parent.
  useEffect(() => {
    if (!open) {
      setGroups([]);
      return;
    }

    let mounted = true;

    get(
      remoteRoutes.groups,
      (data: any) => {
        if (!mounted) {
          return;
        }
        const roots: GroupTreeNode[] = Array.isArray(data)
          ? data
          : data
          ? [data]
          : [];
        const flat = flattenGroups(roots, undefined, editGroup?.id);
        flat.sort((a, b) => a.name.localeCompare(b.name));
        setGroups(flat);
      },
      () => {
        if (mounted) {
          setGroups([]);
        }
      },
    );

    return () => {
      mounted = false;
    };
  }, [open, editGroup?.id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const targetParentId = editGroup?.parentId ?? parentGroup?.id ?? null;
    if (!targetParentId) {
      setParent(null);
      return;
    }

    const selectedParent =
      groups.find((item) => `${item.id}` === `${targetParentId}`) ||
      toComboOption(editGroup?.parent) ||
      toComboOption(parentGroup);
    setParent(selectedParent || null);
  }, [open, groups, editGroup, parentGroup]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!category) {
      toast.error('Category is required');
      return;
    }
    if (!details.trim()) {
      toast.error('Details are required');
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
      address: address
        ? {
            placeId: address.placeId,
            description: address.description || address.name,
          }
        : null,
    };

    const request = isEditing ? put : post;
    const url = remoteRoutes.groups;

    request(
      url,
      payload,
      () => {
        toast.success(
          isEditing
            ? 'Group updated successfully'
            : 'Group created successfully',
        );
        setLoading(false);
        onSuccess();
        handleClose();
      },
      (error: unknown) => {
        console.error('Failed to save group:', error);
        toast.error(
          isEditing ? 'Failed to update group' : 'Failed to create group',
        );
        setLoading(false);
      },
    );
  };

  const handleClose = () => {
    setName('');
    setPrivacy(GroupPrivacy.Private);
    setDetails('');
    setCategory(null);
    setParent(null);
    setAddress(null);
    onClose();
  };

  const dialogTitle = isEditing
    ? `Edit Group: ${editGroup?.name}`
    : parentGroup
    ? `Add Group Under "${parentGroup.name}"`
    : 'Add New Group';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isPhone}
      scroll="paper"
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers={isPhone}>
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
              getOptionLabel={getGroupLabel}
              value={parent}
              onChange={(_, newValue) => setParent(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Parent Group" />
              )}
              renderOption={(props, option) => {
                const { key, ...restProps } = props;
                return (
                  <li key={option.id} {...restProps}>
                    {getGroupLabel(option)}
                  </li>
                );
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <PlaceAutocomplete
              label="Address"
              value={address}
              onChange={setAddress}
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
        <Button onClick={handleClose} disabled={loading} fullWidth={isPhone}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingData}
          fullWidth={isPhone}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isEditing ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGroupDialog;