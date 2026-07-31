import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  Stack,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ajax from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { taskApi } from './api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import type { Task } from '../../utils/types';

interface UserOption {
  id: number;
  username: string;
  fullName: string;
}

interface Props {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onAssigned: (updated: Task) => void;
}

export default function AssignTaskDialog({
  task,
  open,
  onClose,
  onAssigned,
}: Props) {
  const qc = useQueryClient();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ajax
      .get(remoteRoutes.users)
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
        setUsers(list);
      })
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedUser(null);
      setComment('');
    }
  }, [open]);

  const handleAssign = async () => {
    if (!task || !selectedUser) return;
    setSaving(true);
    try {
      const updated = await taskApi.reassign(task.id, selectedUser.id);
      if (comment.trim()) {
        await taskApi.addComment(task.id, comment.trim());
      }
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task assigned successfully');
      onAssigned(updated);
      onClose();
    } catch {
      toast.error('Failed to assign task');
    } finally {
      setSaving(false);
    }
  };

  const taskLabel = task?.title ?? task?.type ?? 'Task';
  const contactName = task?.contact?.person
    ? `${task.contact.person.firstName} ${task.contact.person.lastName}`
    : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            width: { xs: 'calc(100vw - 16px)', sm: 560 },
          },
          elevation: 4,
        },
        backdrop: {
          sx: {
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PersonAddAlt1Icon color="primary" />
          <Box>
            <Typography variant="h6" component="span">
              Assign Task
            </Typography>
            {contactName && (
              <Typography
                variant="body2"
                color="text.secondary"
                display="block"
              >
                {contactName}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} pt={0.5}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={0.5}
            >
              TASK
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {taskLabel}
            </Typography>
          </Box>

          <Autocomplete
            options={users}
            getOptionLabel={(u) => u.fullName || u.username}
            value={selectedUser}
            onChange={(_, val) => setSelectedUser(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assign to"
                placeholder="Select a team member"
                required
                size="small"
              />
            )}
          />

          <TextField
            label="Comment (optional)"
            placeholder="Add a note about this assignment…"
            multiline
            minRows={3}
            fullWidth
            size="small"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedUser || saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? 'Assigning…' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
