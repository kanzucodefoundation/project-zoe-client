import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { taskApi } from './api';
import {
  getLocationGroupIdsFromResponse,
  hasLocationScope,
  scopeTaskListToLocations,
  scopeTasksToLocations,
} from './locationScope';
import type { Task, TaskFilters } from '../../utils/types';
import ajax from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

export const taskKeys = {
  forContact: (contactId: number) => ['tasks', 'contact', contactId] as const,
  all: (filters: TaskFilters) => ['tasks', 'all', filters] as const,
  retentionReport: (window: string) => ['tasks', 'retention', window] as const,
  activity: (contactId: number) => ['activity', contactId] as const,
  myLocationGroups: ['groups', 'me', 'location'] as const,
};

export function useMyLocationGroups() {
  return useQuery({
    queryKey: taskKeys.myLocationGroups,
    queryFn: async () => {
      const r = await ajax.get(remoteRoutes.groupsMyGroups);
      return getLocationGroupIdsFromResponse(r.data);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useContactTasks(
  contactId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: taskKeys.forContact(contactId),
    queryFn: () => taskApi.getForContact(contactId),
    enabled: options?.enabled ?? true,
  });
}

export function useAllTasks(
  filters: TaskFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: taskKeys.all(filters),
    queryFn: () => taskApi.getAll(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useLocationScopedTasks(filters: TaskFilters) {
  const {
    data: locationGroupIds = [],
    isLoading: locationGroupsLoading,
    isError: locationGroupsError,
  } = useMyLocationGroups();
  const locationScopeReady = hasLocationScope(locationGroupIds);
  const filtersWithLocationScope: TaskFilters = useMemo(
    () => ({
      ...filters,
      locationGroupIds,
    }),
    [filters, locationGroupIds],
  );
  const tasksQuery = useAllTasks(filtersWithLocationScope, {
    enabled: !locationGroupsLoading && locationScopeReady,
  });
  const scopedData = useMemo(
    () => scopeTaskListToLocations(tasksQuery.data, locationGroupIds),
    [tasksQuery.data, locationGroupIds],
  );

  return {
    ...tasksQuery,
    data: scopedData,
    locationGroupIds,
    isLoading: locationGroupsLoading || tasksQuery.isLoading,
    isError: locationGroupsError || tasksQuery.isError,
  };
}

export function useLocationScopedContactTasks(contactId: number) {
  const {
    data: locationGroupIds = [],
    isLoading: locationGroupsLoading,
    isError: locationGroupsError,
  } = useMyLocationGroups();
  const locationScopeReady = hasLocationScope(locationGroupIds);
  const tasksQuery = useContactTasks(contactId, {
    enabled: !locationGroupsLoading && locationScopeReady,
  });
  const scopedTasks = useMemo<Task[]>(
    () => scopeTasksToLocations(tasksQuery.data, locationGroupIds),
    [tasksQuery.data, locationGroupIds],
  );

  return {
    ...tasksQuery,
    data: scopedTasks,
    locationGroupIds,
    isLoading: locationGroupsLoading || tasksQuery.isLoading,
    isError: locationGroupsError || tasksQuery.isError,
  };
}

export function useRetentionReport(
  window: 'week' | 'month' | '90days' | 'ytd',
) {
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
      if (contactId)
        qc.invalidateQueries({ queryKey: taskKeys.forContact(contactId) });
      qc.invalidateQueries({ queryKey: ['tasks', 'all'] });
      toast.success('Task created');
    },
    onError: () => toast.error('Failed to create task'),
  });
}

export function useUpdateTaskStatus(contactId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      taskApi.updateStatus(id, data),
    onSuccess: () => {
      if (contactId)
        qc.invalidateQueries({ queryKey: taskKeys.forContact(contactId) });
      qc.invalidateQueries({ queryKey: ['tasks', 'all'] });
      if (contactId)
        qc.invalidateQueries({ queryKey: taskKeys.activity(contactId) });
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
      if (contactId)
        qc.invalidateQueries({ queryKey: taskKeys.forContact(contactId) });
      qc.invalidateQueries({ queryKey: ['tasks', 'all'] });
    },
    onError: () => toast.error('Failed to add comment'),
  });
}
