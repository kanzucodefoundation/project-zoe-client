import api from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import type {
  ServiceInstance,
  RosterMember,
  ServiceStats,
  CheckInPayload,
  GuestPayload,
  LocationOption,
} from './types';

export const fetchTodayService = async (
  locationId: number,
): Promise<ServiceInstance> => {
  const res = await api.get(`${remoteRoutes.services}/today`, {
    params: { locationId },
  });
  return res.data;
};

export const fetchRoster = async (
  serviceId: number,
  searchQuery?: string,
): Promise<RosterMember[]> => {
  const res = await api.get(`${remoteRoutes.services}/${serviceId}/roster`, {
    params: searchQuery ? { search: searchQuery } : {},
  });
  return res.data;
};

export const postCheckIn = async (
  serviceId: number,
  payload: CheckInPayload,
): Promise<void> => {
  await api.post(`${remoteRoutes.services}/${serviceId}/checkin`, payload);
};

export const postGuest = async (
  serviceId: number,
  payload: GuestPayload,
): Promise<RosterMember> => {
  const res = await api.post(
    `${remoteRoutes.services}/${serviceId}/guest`,
    payload,
  );
  return res.data;
};

export const fetchStats = async (serviceId: number): Promise<ServiceStats> => {
  const res = await api.get(`${remoteRoutes.services}/${serviceId}/stats`);
  return res.data;
};

export const fetchLocations = async (): Promise<LocationOption[]> => {
  const res = await api.get(remoteRoutes.groups);
  // Backend returns a tree; flatten to a simple id/name list
  const flatten = (nodes: { id: number; name: string; children?: any[] }[]): LocationOption[] =>
    nodes.flatMap((n) => [{ id: n.id, name: n.name }, ...flatten(n.children ?? [])]);
  return flatten(Array.isArray(res.data) ? res.data : []);
};
