import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, Stack, Divider,
  Button, Autocomplete, TextField, List, ListItem,
  ListItemText, Avatar, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import TaskStatusChip from './TaskStatusChip';
import TaskTypeChip from './TaskTypeChip';
import UpdateStatusDialog from './UpdateStatusDialog';
import { useReassignTask, useAddComment } from './hooks';
import { CLOSED_STATUSES, type Task } from '../../utils/types';
import { taskApi } from './api';
import { useQueryClient } from '@tanstack/react-query';
import { taskKeys } from './hooks';
import ajax from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

dayjs.extend(relativeTime);

interface Props {
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: (updated: Task) => void;
  contactId?: number;
}

interface UserOption {
  id: number;
  username: string;
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
function isImage(url: string) {
  return IMAGE_EXTS.some((ext) => url.toLowerCase().endsWith(ext));
}

export default function TaskDrawer({ task, onClose, onTaskUpdated, contactId }: Props) {
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [comment, setComment] = useState('');
  const [showAttachForm, setShowAttachForm] = useState(false);
  const [attachUrl, setAttachUrl] = useState('');
  const [attachLabel, setAttachLabel] = useState('');
  const [localTask, setLocalTask] = useState<Task | null>(task);

  const reassign = useReassignTask();
  const addComment = useAddComment(localTask?.id ?? 0, contactId);
  const qc = useQueryClient();

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  useEffect(() => {
    ajax.get(remoteRoutes.users).then((r) => {
      const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
      setUsers(list);
    }).catch(() => setUsers([]));
  }, []);

  if (!localTask) return null;

  const isClosed = CLOSED_STATUSES.includes(localTask.status);
  const contactName = localTask.contact?.person
    ? `${localTask.contact.person.firstName} ${localTask.contact.person.lastName}`.trim()
    : 'Contact';

  const handleSendComment = () => {
    if (!comment.trim()) return;
    addComment.mutate(comment, {
      onSuccess: () => setComment(''),
    });
  };

  const handleSaveAttachment = async () => {
    if (!attachUrl.trim()) return;
    try {
      await taskApi.addAttachment(localTask.id, attachUrl, attachLabel || undefined);
      if (contactId) qc.invalidateQueries({ queryKey: taskKeys.forContact(contactId) });
      qc.invalidateQueries({ queryKey: ['tasks', 'all'] });
      setShowAttachForm(false);
      setAttachUrl('');
      setAttachLabel('');
    } catch {
      // error handled by api
    }
  };

  return (
    <Drawer anchor="right" open={Boolean(localTask)} onClose={onClose} PaperProps={{ sx: { width: 480, p: 3 } }}>
      {/* Header */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <Box>
          <TaskTypeChip type={localTask.type} />
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {contactName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Status */}
      <Box mb={2}>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          STATUS
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TaskStatusChip status={localTask.status} />
          {isClosed ? (
            <Typography variant="body2" color="text.secondary">Closed</Typography>
          ) : (
            <Button size="small" variant="outlined" onClick={() => setUpdateStatusOpen(true)}>
              Update Status
            </Button>
          )}
        </Stack>
      </Box>

      {/* Assignment */}
      <Box mb={2}>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          ASSIGNED TO
        </Typography>
        <Autocomplete
          options={users}
          getOptionLabel={(u) => u.username}
          value={users.find((u) => u.id === localTask.assignedTo?.id) ?? null}
          disabled={isClosed}
          onChange={(_, val) => {
            if (val) {
              reassign.mutate({ id: localTask.id, assignedToId: val.id });
            }
          }}
          renderInput={(params) => <TextField {...params} size="small" placeholder="Unassigned" />}
        />
      </Box>

      {/* Details */}
      <Box mb={2}>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          DETAILS
        </Typography>
        <Stack spacing={0.5}>
          {localTask.title && (
            <Typography variant="body2"><strong>Title:</strong> {localTask.title}</Typography>
          )}
          {localTask.dueAt && (
            <Typography variant="body2">
              <strong>Due:</strong> {dayjs(localTask.dueAt).format('DD MMM YYYY')}
            </Typography>
          )}
          {localTask.createdBy && (
            <Typography variant="body2">
              <strong>Created by:</strong> {localTask.createdBy.username}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Created:</strong> {dayjs(localTask.createdAt).format('DD MMM YYYY')}
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Comments */}
      <Box mb={2}>
        <Typography variant="subtitle2" mb={1}>Comments</Typography>
        {localTask.comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No comments yet</Typography>
        ) : (
          <List dense disablePadding>
            {localTask.comments.map((c) => (
              <ListItem key={c.id} alignItems="flex-start" disableGutters>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>{c.author.username}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(c.createdAt).fromNow()}
                      </Typography>
                    </Stack>
                  }
                  secondary={c.body}
                />
              </ListItem>
            ))}
          </List>
        )}
        <Stack direction="row" spacing={1} mt={1}>
          <TextField
            size="small"
            multiline
            fullWidth
            placeholder="Add a comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
          />
          <IconButton onClick={handleSendComment} disabled={addComment.isPending || !comment.trim()}>
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Attachments */}
      <Box>
        <Typography variant="subtitle2" mb={1}>Attachments</Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
          {localTask.attachments.map((a) =>
            isImage(a.url) ? (
              <Box
                key={a.id}
                component="img"
                src={a.url}
                alt={a.label ?? 'attachment'}
                sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
              />
            ) : (
              <Chip
                key={a.id}
                icon={<AttachFileIcon />}
                label={a.label ?? a.url.split('/').pop() ?? 'file'}
                component="a"
                href={a.url}
                target="_blank"
                clickable
              />
            )
          )}
        </Box>
        {showAttachForm ? (
          <Stack spacing={1}>
            <TextField
              size="small"
              label="URL"
              fullWidth
              value={attachUrl}
              onChange={(e) => setAttachUrl(e.target.value)}
            />
            <TextField
              size="small"
              label="Label (optional)"
              fullWidth
              value={attachLabel}
              onChange={(e) => setAttachLabel(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" onClick={handleSaveAttachment}>Save</Button>
              <Button size="small" onClick={() => setShowAttachForm(false)}>Cancel</Button>
            </Stack>
          </Stack>
        ) : (
          <Button size="small" onClick={() => setShowAttachForm(true)}>Add Attachment</Button>
        )}
      </Box>

      <UpdateStatusDialog
        open={updateStatusOpen}
        task={localTask}
        onClose={() => setUpdateStatusOpen(false)}
        onSuccess={(updated) => {
          setLocalTask(updated);
          onTaskUpdated(updated);
        }}
      />
    </Drawer>
  );
}
