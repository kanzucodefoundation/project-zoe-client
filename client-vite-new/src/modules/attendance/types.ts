export interface ServiceInstance {
  id: number;
  serviceDate: string;
  scheduleId: number;
  status: string;
  cachedTotalCount: number;
  schedule?: {
    id: number;
    name: string;
    startTime: string;
    locationGroupId: number;
    location?: { id: number; name: string };
  };
}

export interface RosterMember {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  isFirstTimer?: boolean;
  isChild?: boolean;
}

export interface ServiceStats {
  totalCheckedIn: number;
  firstTimeGuests: number;
  children: number;
  adults: number;
  expectedCount?: number;
}

export interface CheckInPayload {
  contactIds: number[];
  isChild?: boolean;
  isFirstTime?: boolean;
}

export interface GuestPayload {
  firstName: string;
  lastName: string;
  phone?: string;
  isChild: boolean;
  isFirstTime: boolean;
}

export interface PendingCheckIn {
  id: string;
  serviceId: number;
  payload: CheckInPayload;
  timestamp: number;
}

export interface LocationOption {
  id: number;
  name: string;
}
