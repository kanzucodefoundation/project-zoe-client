import { IOption } from "../../components/inputs/inputHelpers";

export interface IGroup {
  id: string;
  privacy: GroupPrivacy;
  name: string;
  details?: string;
  category?: any;
  categoryId: string;
  parent?: any;
  parentId?: number;
  metaData?: any;
  address?: any;
  leaders?: number[];
  children?: number[];
  totalAttendance?: number;
  averageAttendance?: string;
  childEvents?: any[];
}

export interface IGroupMembership {
  id: string;
  group: IOption;
  groupId: string;
  contact: any;
  contactId: string;
  role: GroupRole;
}

export interface ICreateBatchMembership {
  groupId: string;
  members: string[];
  role: GroupRole;
}

export enum GroupPrivacy {
  Private = "Private",
  Public = "Public"
}

export enum GroupRole {
  Member = "Member",
  Leader = "Leader"
}

export enum GroupCategory {
  Cohort = "Cohort",
  MC = "MC",
  GarageTeam = "GarageTeam",
  Huddle = "Huddle",
  Location = "Loaction",
}

export interface IStats {
  isComplete: boolean;
  percentage: number;
  childCount: number;
}
