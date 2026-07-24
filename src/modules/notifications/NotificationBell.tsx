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
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from './hooks';
import type { Notification } from '../../utils/types';
import { localRoutes } from '../../data/constants';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data, isLoading } = useNotifications(1, 8); // preview: latest 8
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleItemClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    handleClose();
    if (n.link) navigate(n.link);
  };

  const notifications = data?.data ?? [];

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Open notifications" size="small">
        <Badge badgeContent={unreadCount} color="error" max={99} >
          <NotificationsRoundedIcon sx={{ fontSize: 24 }}/>
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 480 } } }}
      >
        <Box sx={{display:"flex", justifyContent:"space-between", alignItems:"center", p:1}}>
          <Typography variant="subtitle1"  sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllRead.mutate()} sx={{display:"flex", alignItems:"center", p:1, gap:1}}>
              <DoneAllIcon/>  Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {isLoading ? (
          <Box sx={{display:"flex", justifyContent:"space-between", py:3}}>
            <CircularProgress size={24} />
          </Box>
        ) : !notifications ? (
          <Box sx={{textAlign:"center", py:3}}>
            <Typography variant="body2" color="text.secondary">
              Unable to load notifications at this time
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{textAlign:"center", py:3}}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>

        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                py: 1.25,
                bgcolor: n.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <Box sx={{width:"100%"}}>
                <Box sx={{display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
                  <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 600 }}>
                    {n.title}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {dayjs(n.createdAt).fromNow()}
                  </Typography>
                </Box>
                {n.body && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {n.body}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))
        )}

        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            navigate(localRoutes.notificationMessages);
          }}
          sx={{ fontWeight: 600 }}
        >
          View all notifications
        </MenuItem>
      </Menu>
    </>
  );
}