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

export const fetchTodayServices = async (
  locationId: number,
): Promise<ServiceInstance[]> => {
  const res = await api.get(`${remoteRoutes.services}/today`, {
    params: { locationId },
  });
  return Array.isArray(res.data) ? res.data : [res.data];
};

export const fetchRoster = async (
  serviceId: number,
  searchQuery?: string,
): Promise<RosterMember[]> => {
  const params: Record<string, unknown> = {};
  if (searchQuery) params.search = searchQuery;
  const res = await api.get(`${remoteRoutes.services}/${serviceId}/roster`, {
    params,
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

export const fetchAllLocationGroups = async (): Promise<LocationOption[]> => {
  const res = await api.get(remoteRoutes.groups, {
    params: { purpose: 'location' },
  });
  const flatten = (nodes: any[]): LocationOption[] =>
    nodes.flatMap((n) => [
      { id: n.id as number, name: n.name as string },
      ...flatten(n.children ?? []),
    ]);
  return flatten(Array.isArray(res.data) ? res.data : []);
};

export const fetchMyLocationGroups = async (): Promise<LocationOption[]> => {
  const res = await api.get(remoteRoutes.groupsMyGroups);
  const memberships: any[] = Array.isArray(res.data) ? res.data : [];
  return memberships
    .filter((m) => {
      if (m.isActive === false) return false;
      const purpose = (
        m.group?.category?.purpose ??
        m.category?.purpose ??
        m.groupCategoryPurpose ??
        m.categoryPurpose ??
        ''
      )
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_');
      const catName = (
        m.group?.category?.name ??
        m.category?.name ??
        m.categoryName ??
        ''
      )
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_');
      return purpose === 'location' || catName === 'location';
    })
    .map((m) => ({
      id: Number(m.groupId ?? m.group?.id ?? m.id),
      name: String(m.group?.name ?? m.name ?? 'Unknown'),
    }));
};
