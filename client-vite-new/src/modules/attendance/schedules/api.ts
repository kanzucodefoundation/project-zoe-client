import api from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import type {
  ServiceSchedule,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from './types';

const base = `${remoteRoutes.services}/schedules`;

export const fetchSchedules = async (
  locationId?: number,
  tags?: string[],
): Promise<ServiceSchedule[]> => {
  const params: Record<string, any> = {};
  if (locationId) params.locationId = locationId;
  if (tags?.length) params.tags = tags.join(',');
  const res = await api.get(base, { params });
  return res.data;
};

export const createSchedule = async (
  payload: CreateSchedulePayload,
): Promise<ServiceSchedule> => {
  const res = await api.post(base, payload);
  return res.data;
};

export const updateSchedule = async (
  id: number,
  payload: UpdateSchedulePayload,
): Promise<ServiceSchedule> => {
  const res = await api.put(`${base}/${id}`, payload);
  return res.data;
};
