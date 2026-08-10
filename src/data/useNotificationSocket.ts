import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { notificationKeys } from '../modules/notifications/hooks';

import { apiBaseUrl } from './constants';

// `new URL('/notifications', apiBaseUrl)` discards any existing path in
// apiBaseUrl (e.g. "/server") because a leading slash resolves as absolute.
// Concatenate instead so the reverse-proxy prefix is preserved.
const NOTIFICATIONS_SOCKET_URL = `${apiBaseUrl.replace(/\/+$/, '')}/notifications`;
const SOCKET_IO_PATH = `${new URL(apiBaseUrl).pathname.replace(/\/+$/, '')}/socket.io`;

export function useNotificationSocket(token: string | null) {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(NOTIFICATIONS_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      autoConnect: false,
      // Engine.io handshake must hit the same proxy prefix as the REST API
      // (e.g. "/server/socket.io"), otherwise it falls back to the origin
      // root and errors out behind the proxy.
      path: SOCKET_IO_PATH,
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
    const connectTimer = setTimeout(() => socket.connect(), 0);

    return () => {
      clearTimeout(connectTimer);
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [token, qc]);

  return socketRef;
}
