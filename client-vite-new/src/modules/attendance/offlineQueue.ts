import { v4 as uuidv4 } from 'uuid';
import type { PendingCheckIn, CheckInPayload, RosterMember } from './types';

const QUEUE_KEY = '__zoe__attendance_queue__';
const ROSTER_CACHE_KEY = '__zoe__roster_cache__';
const SELECTED_LOCATION_KEY = '__zoe__selected_location__';
const ROSTER_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// --- Offline check-in queue ---

export const getQueue = (): PendingCheckIn[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const enqueue = (serviceId: number, payload: CheckInPayload): PendingCheckIn => {
  const item: PendingCheckIn = {
    id: uuidv4(),
    serviceId,
    payload,
    timestamp: Date.now(),
  };
  const queue = getQueue();
  queue.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return item;
};

export const dequeue = (id: string) => {
  const queue = getQueue().filter((item) => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

// --- Roster cache for offline use ---

interface RosterCache {
  serviceId: number;
  roster: RosterMember[];
  timestamp: number;
}

export const cacheRoster = (serviceId: number, roster: RosterMember[]) => {
  const cache: RosterCache = { serviceId, roster, timestamp: Date.now() };
  localStorage.setItem(ROSTER_CACHE_KEY, JSON.stringify(cache));
};

export const getCachedRoster = (serviceId: number): RosterMember[] | null => {
  try {
    const cached: RosterCache = JSON.parse(
      localStorage.getItem(ROSTER_CACHE_KEY) || 'null',
    );
    if (!cached || cached.serviceId !== serviceId) return null;
    if (Date.now() - cached.timestamp > ROSTER_CACHE_TTL) return null;
    return cached.roster;
  } catch {
    return null;
  }
};

// --- Selected location persistence ---

export const getSelectedLocation = (): number | null => {
  const val = localStorage.getItem(SELECTED_LOCATION_KEY);
  return val ? parseInt(val, 10) : null;
};

export const setSelectedLocation = (locationId: number) => {
  localStorage.setItem(SELECTED_LOCATION_KEY, String(locationId));
};
