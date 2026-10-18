import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  TablePagination,
  Divider,
  ListItemButton,
  Paper,
  Tooltip,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsOffRoundedIcon from '@mui/icons-material/NotificationsOffRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from './hooks';
import NotificationAvatar from './NotificationAvatar';
import PageHeader from '../../components/ui/PageHeader';
import type { Notification } from '../../utils/types';

export default function Notifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const { data, isLoading, isError } = useNotifications(page + 1, rowsPerPage);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const unreadCount = data?.unreadCount ?? 0;

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
  };

  const state = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : notifications.length === 0
        ? 'empty'
        : 'ready';

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Notifications"
        meta={
          unreadCount > 0 ? (
            <Chip
              size="small"
              color="primary"
              label={`${unreadCount} unread`}
            />
          ) : undefined
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <Paper sx={{ overflow: 'hidden' }}>
        {state === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {state === 'error' && (
          <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
            <ErrorOutlineRoundedIcon
              sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
            />
            <Typography color="text.secondary">
              Unable to load notifications at this time
            </Typography>
          </Box>
        )}

        {state === 'empty' && (
          <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
            <NotificationsOffRoundedIcon
              sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
            />
            <Typography color="text.secondary">No notifications yet</Typography>
            <Typography variant="caption" color="text.disabled">
              Anything assigned to you will show up here.
            </Typography>
          </Box>
        )}

        {state === 'ready' && (
          <>
            {notifications.map((n, idx) => (
              <Box key={n.id}>
                <ListItemButton
                  onClick={() => handleClick(n)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    gap: 2,
                    alignItems: 'flex-start',
                    borderRadius: 0,
                    bgcolor: n.isRead ? 'transparent' : 'action.selected',
                  }}
                >
                  <NotificationAvatar type={n.type} />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 1,
                        width: '100%',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: n.isRead ? 400 : 600,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {n.title}
                      </Typography>
                      <Tooltip
                        title={dayjs(n.createdAt).format('D MMM YYYY, HH:mm')}
                      >
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ flexShrink: 0 }}
                        >
                          {dayjs(n.createdAt).fromNow()}
                        </Typography>
                      </Tooltip>
                    </Box>

                    {n.body && (
                      <Typography variant="body2" color="text.secondary">
                        {n.body}
                      </Typography>
                    )}
                  </Box>

                  {!n.isRead && (
                    <Box
                      aria-label="Unread"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        flexShrink: 0,
                        mt: 1,
                      }}
                    />
                  )}
                </ListItemButton>
                {idx < notifications.length - 1 && <Divider />}
              </Box>
            ))}

            <Divider />
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
