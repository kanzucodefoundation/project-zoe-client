export type ServiceType = 'Sunday' | 'Midweek' | 'Special';
export type Frequency = 'weekly' | 'biweekly' | 'monthly';

export interface ScheduleMetaData {
  expectedAttendance?: number;
  hasChildrensProgram?: boolean;
  livestreamEnabled?: boolean;
}

export interface ServiceSchedule {
  id: number;
  name: string;
  locationGroupId: number;
  location?: { id: number; name: string };
  serviceType: ServiceType;
  startTime: string;
  frequency: Frequency;
  daysOfWeek: number[];
  tags: string[];
  metaData?: ScheduleMetaData;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSchedulePayload {
  name: string;
  locationGroupId: number;
  serviceType: ServiceType;
  startTime: string;
  frequency: Frequency;
  daysOfWeek: number[];
  tags?: string[];
  metaData?: ScheduleMetaData;
}

export interface UpdateSchedulePayload extends Partial<CreateSchedulePayload> {
  isActive?: boolean;
}
