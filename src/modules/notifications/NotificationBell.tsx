import { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import NotificationsOffRoundedIcon from '@mui/icons-material/NotificationsOffRounded';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from './hooks';
import NotificationAvatar from './NotificationAvatar';
import type { Notification } from '../../utils/types';
import { localRoutes } from '../../data/constants';

interface NotificationBellProps {
  onCloseMenu?: () => void;
}

export default function NotificationBell({
  onCloseMenu,
}: NotificationBellProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data, isLoading, isError } = useNotifications(1, 5);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleItemClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    handleClose();
    if (onCloseMenu) onCloseMenu();
    if (n.link) navigate(n.link);
  };

  const notifications = data?.data ?? [];

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleOpen}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
          size="small"
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsRoundedIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 'min(380px, calc(100vw - 16px))',
              maxHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          },
          list: { sx: { p: 0, flex: 1, overflowY: 'auto' } },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                {unreadCount} unread
              </Typography>
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoading && isError && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Unable to load notifications at this time
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <NotificationsOffRoundedIcon
              sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}

        {!isLoading &&
          !isError &&
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                gap: 1.5,
                px: 2,
                py: 1.25,
                borderRadius: 0,
                bgcolor: n.isRead ? 'transparent' : 'action.selected',
              }}
            >
              <NotificationAvatar type={n.type} size={32} />

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
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ flexShrink: 0 }}
                  >
                    {dayjs(n.createdAt).fromNow()}
                  </Typography>
                </Box>

                {n.body && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {n.body}
                  </Typography>
                )}
              </Box>

              {!n.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    flexShrink: 0,
                    mt: 0.75,
                  }}
                />
              )}
            </MenuItem>
          ))}

        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            if (onCloseMenu) onCloseMenu();
            navigate(localRoutes.notificationMessages);
          }}
          sx={{
            justifyContent: 'center',
            gap: 0.5,
            py: 1.25,
            borderRadius: 0,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          View all notifications
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
        </MenuItem>
      </Menu>
    </>
  );
}
