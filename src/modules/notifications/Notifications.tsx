import { useState } from 'react';
import {
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  TablePagination,
  Divider,
  ListItemButton,
} from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from './hooks';
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

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3, justifyContent:"space-between", alignItems:{ xs: 'flex-start', sm: 'center' } }}
      >
        <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
          Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button variant="outlined" onClick={() => markAllRead.mutate()}>
            Mark all as read
          </Button>
        )}
      </Stack>

      {isLoading ? (
        <Box sx={{display:"flex", justifyContent:"center", py:3}}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box sx={{textAlign:"center", py:3}}>
          <Typography color="text.secondary">
            Unable to load notifications at this time
          </Typography>
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{textAlign:"center", py:3}}>
          <Typography color="text.secondary">No notifications yet</Typography>
        </Box>

      ) : (
        <Box>
          {notifications.map((n, idx) => (
            <Box key={n.id}>
              <ListItemButton
                onClick={() => handleClick(n)}
                sx={{
                  py: 1.5,
                  display: "block",
                  bgcolor: n.isRead ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <Box sx={{display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
                  <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 600 }}>
                    {n.title}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {dayjs(n.createdAt).fromNow()}
                  </Typography>
                </Box>
                {n.body && (
                  <Typography variant="body2" color="text.secondary">
                    {n.body}
                  </Typography>
                )}
                
              </ListItemButton>
              {idx < notifications.length - 1 && <Divider />}
            </Box>
          ))}
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </Box>
      )}
    </Box>
  );
}