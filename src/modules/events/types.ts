export interface IEvent {
  id: string;
  privacy: string;
  name: string;
  startDate: Date;
  endDate: Date;
  submittedAt: Date;
  submittedBy: string;
  details: string;
  venue?: any;
  categoryId: string;
  category: any;
  groupId: number;
  group: any;
  attendance: IAttendance[];
  leaders: any[];
  metaData?: MetaData;
}

export interface IAttendance {
  id: number;
  isVisitor: boolean;
  eventId: string;
  contactId: number;
}

export interface MetaData {}
