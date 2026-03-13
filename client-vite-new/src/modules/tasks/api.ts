import ajax from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type { Task, TaskComment, TaskAttachment, ContactActivity, RetentionSummary, TaskFilters } from '../../utils/types';

export const taskApi = {
  create: (data: {
    contactId: number;
    type: string;
    title?: string;
    assignedToId?: number;
    dueAt?: string;
  }): Promise<Task> =>
    ajax.post(`${remoteRoutes.tasks}`, data).then((r) => r.data),

  getForContact: (contactId: number): Promise<Task[]> =>
    ajax.get(`${remoteRoutes.tasks}/contact/${contactId}`).then((r) => r.data),

  getAll: (filters: TaskFilters): Promise<{ data: Task[]; total: number }> =>
    ajax.get(`${remoteRoutes.tasks}`, { params: filters }).then((r) => r.data),

  updateStatus: (id: number, data: Record<string, any>): Promise<Task> =>
    ajax.patch(`${remoteRoutes.tasks}/${id}/status`, data).then((r) => r.data),

  reassign: (id: number, assignedToId: number): Promise<Task> =>
    ajax.patch(`${remoteRoutes.tasks}/${id}/assign`, { assignedToId }).then((r) => r.data),

  addComment: (id: number, body: string): Promise<TaskComment> =>
    ajax.post(`${remoteRoutes.tasks}/${id}/comments`, { body }).then((r) => r.data),

  addAttachment: (id: number, url: string, label?: string): Promise<TaskAttachment> =>
    ajax.post(`${remoteRoutes.tasks}/${id}/attachments`, { url, label }).then((r) => r.data),

  getRetentionReport: (window: 'month' | '90days' | 'ytd'): Promise<RetentionSummary> =>
    ajax.get(`${remoteRoutes.tasks}/retention-report`, { params: { window } }).then((r) => r.data),

  getContactActivity: (contactId: number): Promise<ContactActivity[]> =>
    ajax.get(`${remoteRoutes.contacts}/${contactId}/activity`).then((r) => r.data),
};
