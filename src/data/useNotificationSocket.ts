import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { notificationKeys } from '../modules/notifications/hooks';

import { apiBaseUrl } from './constants';

const SOCKET_URL = apiBaseUrl;

export function useNotificationSocket(token: string | null) {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });    
    socketRef.current = socket;

    socket.on('notification:new', (notification) => {
      // Bump unread count + prepend to the cached list without a full refetch
      qc.setQueryData(notificationKeys.unreadCount, (old: number = 0) => old + 1);
      qc.invalidateQueries({ queryKey: notificationKeys.list });

      toast.info(notification.title, { autoClose: 5000 });
    });

    socket.on('connect_error', (err) => {
      console.error('Notification socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [token, qc]);

  return socketRef;
}