import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ajax from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type { Notification } from '../../utils/types';

export const notificationKeys = {
  list: ['notifications', 'list'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...notificationKeys.list, page, limit],
    queryFn: async () => {
      const r = await ajax.get(remoteRoutes.notificationMessages, {
        params: { page, limit },
      });
      return r.data as { data: Notification[]; total: number; unreadCount: number };
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: async () => {
      const r = await ajax.get(`${remoteRoutes.notificationMessages}/unread-count`);
      return r.data.count as number;
    },
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      ajax.patch(`${remoteRoutes.notificationMessages}/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.list });
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => ajax.patch(`${remoteRoutes.notificationMessages}/read-all`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.list });
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}