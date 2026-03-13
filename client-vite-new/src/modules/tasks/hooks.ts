import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { taskApi } from './api';
import type { TaskFilters } from '../../utils/types';

export const taskKeys = {
  forContact: (contactId: number) => ['tasks', 'contact', contactId] as const,
  all: (filters: TaskFilters) => ['tasks', 'all', filters] as const,
  retentionReport: (window: string) => ['tasks', 'retention', window] as const,
  activity: (contactId: number) => ['activity', contactId] as const,
};

export function useContactTasks(contactId: number) {
  return useQuery({
    queryKey: taskKeys.forContact(contactId),
    queryFn: () => taskApi.getForContact(contactId),
  });
}

export function useAllTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.all(filters),
    queryFn: () => taskApi.getAll(filters),
  });
}

export function useRetentionReport(window: 'month' | '90days' | 'ytd') {
  return useQuery({
    queryKey: taskKeys.retentionReport(window),
    queryFn: () => taskApi.getRetentionReport(window),
  });
}

export function useContactActivity(contactId: number) {
  return useQuery({
    queryKey: taskKeys.activity(contactId),
    queryFn: () => taskApi.getContactActivity(contactId),
  });
}

export function useCreateTask(contactId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      if (contactId) qc.invalidateQueries({ queryKey: taskKeys.forContact(contactId) });
      qc.invalidateQueries({ queryKey: ['tasks', 'all'] });
      toast.success('Task created');
    },
    onError: () => toast.error('Failed to create task'),
  });
}

export function useUpdateTaskStatus(contactId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      taskApi.updateStatus(id, data),
    onSuccess: () => {
      if (contactId) qc.invalidateQueries({ queryKey: taskKeys.forContact(contactId) });
      qc.invalidateQueries({ queryKey: ['tasks', 'all'] });
      if (contactId) qc.invalidateQueries({ queryKey: taskKeys.activity(contactId) });
      toast.success('Task updated');
    },
    onError: () => toast.error('Failed to update task'),
  });
}

export function useReassignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: number; assignedToId: number }) =>
      taskApi.reassign(id, assignedToId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task reassigned');
    },
    onError: () => toast.error('Failed to reassign task'),
  });
}

export function useAddComment(taskId: number, contactId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => taskApi.addComment(taskId, body),
    onSuccess: () => {
      if (contactId) qc.invalidateQueries({ queryKey: taskKeys.forContact(contactId) });
      qc.invalidateQueries({ queryKey: ['tasks', 'all'] });
    },
    onError: () => toast.error('Failed to add comment'),
  });
}
