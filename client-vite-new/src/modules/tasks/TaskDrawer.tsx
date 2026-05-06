import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Divider,
  Button,
  Autocomplete,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TaskStatusChip from './TaskStatusChip';
import UpdateStatusDialog from './UpdateStatusDialog';
import { useReassignTask, useAddComment } from './hooks';
import { CLOSED_STATUSES, type Task } from '../../utils/types';
import { taskApi } from './api';
import { useQueryClient } from '@tanstack/react-query';
import { taskKeys } from './hooks';
import ajax from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type { RootState } from '../../data/store';
import { canEditTasks } from '../../utils/permissions';

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
  fullName: string;
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
function isImage(url: string) {
  return IMAGE_EXTS.some((ext) => url.toLowerCase().endsWith(ext));
}

export default function TaskDrawer({
  task,
  onClose,
  onTaskUpdated,
  contactId,
}: Props) {
  const user = useSelector((state: RootState) => state.core.user);
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
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
    if (!task) {
      setLocalTask(null);
      return;
    }
    setLocalTask(task);
    taskApi
      .getById(task.id)
      .then(setLocalTask)
      .catch(() => {});
  }, [task?.id]);

  useEffect(() => {
    ajax
      .get(remoteRoutes.users)
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
        setUsers(list);
      })
      .catch(() => setUsers([]));
  }, []);

  if (!localTask) return null;

  const isClosed = CLOSED_STATUSES.includes(localTask.status);
  const canEditTaskData = canEditTasks(user);

  const handleSendComment = () => {
    if (!comment.trim()) return;
    addComment.mutate(comment, {
      onSuccess: (newComment) => {
        setComment('');
        setLocalTask((prev) =>
          prev
            ? { ...prev, comments: [...(prev.comments ?? []), newComment] }
            : prev,
        );
      },
    });
  };

  const handleSaveAttachment = async () => {
    if (!attachUrl.trim()) return;
    try {
      await taskApi.addAttachment(
        localTask.id,
        attachUrl,
        attachLabel || undefined,
      );
      if (contactId)
        qc.invalidateQueries({ queryKey: taskKeys.forContact(contactId) });
      qc.invalidateQueries({ queryKey: ['tasks', 'all'] });
      setShowAttachForm(false);
      setAttachUrl('');
      setAttachLabel('');
    } catch {
      // error handled by api
    }
  };

  return (
    <Drawer
      anchor="right"
      open={Boolean(localTask)}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 480 },
          maxWidth: '100vw',
          height: '100dvh',
          p: 0,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          gap: 1,
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {localTask.title || 'Task Details'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dayjs(localTask.createdAt).format('DD MMM YYYY')}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close task details"
          sx={{ width: 40, height: 40 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          px: { xs: 2, sm: 3 },
          py: 2,
          pb: 'calc(24px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Title / Created by / Created */}
        <Stack spacing={0.5} mb={2}>
          {localTask.title && (
            <Typography variant="body2">
              <strong>Title:</strong> {localTask.title}
            </Typography>
          )}
          {localTask.createdBy && (
            <Typography variant="body2">
              <strong>Created by:</strong> {localTask.createdBy.username}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Created:</strong>{' '}
            {dayjs(localTask.createdAt).format('DD MMM YYYY')}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Status */}
        <Box mb={2}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={0.5}
          >
            STATUS
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1}
          >
            <TaskStatusChip status={localTask.status} />
            {isClosed ? (
              <Typography variant="body2" color="text.secondary">
                Closed
              </Typography>
            ) : canEditTaskData ? (
              <Button
                size="small"
                variant="outlined"
                fullWidth={isPhone}
                onClick={() => setUpdateStatusOpen(true)}
              >
                Update Status
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Read only
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Assignment */}
        <Box mb={2}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={0.5}
          >
            ASSIGNED TO
          </Typography>
          <Autocomplete
            options={users}
            getOptionLabel={(u) => u.fullName}
            value={users.find((u) => u.id === localTask.assignedTo?.id) ?? null}
            disabled={isClosed || !canEditTaskData}
            onChange={(_, val) => {
              if (val && canEditTaskData) {
                reassign.mutate({ id: localTask.id, assignedToId: val.id });
              }
            }}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder="Unassigned" />
            )}
          />
        </Box>

        {/* Due date */}
        <Box mb={2}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={0.5}
          >
            DUE DATE
          </Typography>
          <DatePicker
            value={localTask.dueAt ? dayjs(localTask.dueAt) : null}
            onChange={async (val) => {
              if (!canEditTaskData) return;
              const dueAt = val ? dayjs(val).toISOString() : null;
              try {
                const updated = await taskApi.update(localTask.id, { dueAt });
                setLocalTask(updated);
                onTaskUpdated(updated);
              } catch {
                // error handled by api
              }
            }}
            disabled={isClosed || !canEditTaskData}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Comments */}
        <Box mb={2}>
          <Typography variant="subtitle2" mb={1}>
            Comments
          </Typography>
          {(localTask.comments?.length ?? 0) === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No comments yet
            </Typography>
          ) : (
            <List dense disablePadding>
              {localTask.comments.map((c) => (
                <ListItem key={c.id} alignItems="flex-start" disableGutters>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {c.author.username}
                        </Typography>
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
          {canEditTaskData ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              mt={1}
              alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            >
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
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSendComment}
                disabled={addComment.isPending || !comment.trim()}
                fullWidth={isPhone}
                sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
              >
                Send
              </Button>
            </Stack>
          ) : null}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Attachments */}
        <Box>
          <Typography variant="subtitle2" mb={1}>
            Attachments
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
            {(localTask.attachments ?? []).map((a) =>
              isImage(a.url) ? (
                <Box
                  key={a.id}
                  component="img"
                  src={a.url}
                  alt={a.label ?? 'attachment'}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
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
                  sx={{
                    maxWidth: '100%',
                    '& .MuiChip-label': {
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              ),
            )}
          </Box>
          {canEditTaskData ? (
            showAttachForm ? (
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth={isPhone}
                    onClick={handleSaveAttachment}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    fullWidth={isPhone}
                    onClick={() => setShowAttachForm(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Button
                size="small"
                fullWidth={isPhone}
                onClick={() => setShowAttachForm(true)}
              >
                Add Attachment
              </Button>
            )
          ) : null}
        </Box>
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
