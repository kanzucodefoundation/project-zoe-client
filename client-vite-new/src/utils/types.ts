export type $TsFixMe = any;

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const TaskType = {
  CALL: 'call',
  VISIT: 'visit',
  MATCH: 'match',
  FOLLOW_UP: 'follow_up',
} as const;
export type TaskType = typeof TaskType[keyof typeof TaskType];

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  UNREACHABLE: 'unreachable',
  MATCHED_TO_FELLOWSHIP: 'matched_to_fellowship',
  ATTENDED_FELLOWSHIP: 'attended_fellowship',
  JOINED_SERVING_TEAM: 'joined_serving_team',
  GOT_BAPTISED: 'got_baptised',
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const CLOSED_STATUSES: TaskStatus[] = [
  TaskStatus.DONE,
  TaskStatus.UNREACHABLE,
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.UNREACHABLE]: 'Unreachable',
  [TaskStatus.MATCHED_TO_FELLOWSHIP]: 'Tea Hangout - Matched to Fellowship',
  [TaskStatus.ATTENDED_FELLOWSHIP]: 'Attended Fellowship',
  [TaskStatus.JOINED_SERVING_TEAM]: 'Joined Serving Team',
  [TaskStatus.GOT_BAPTISED]: 'Got Baptised',
};

export const TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.CALL]: 'Call',
  [TaskType.VISIT]: 'Visit',
  [TaskType.MATCH]: 'Match',
  [TaskType.FOLLOW_UP]: 'Follow Up',
};

export const NEXT_STATUS_OPTIONS: TaskStatus[] = [
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
  TaskStatus.UNREACHABLE,
  TaskStatus.MATCHED_TO_FELLOWSHIP,
  TaskStatus.ATTENDED_FELLOWSHIP,
  TaskStatus.JOINED_SERVING_TEAM,
  TaskStatus.GOT_BAPTISED,
];

export interface TaskUser {
  id: number;
  username: string;
  contact?: {
    person?: { firstName: string; lastName: string; avatar?: string };
  };
}

export interface Task {
  id: number;
  contactId: number;
  contact?: {
    id: number;
    person?: { firstName: string; lastName: string; avatar?: string };
  };
  type: TaskType;
  title: string | null;
  status: TaskStatus;
  assignedTo?: TaskUser;
  createdBy?: TaskUser;
  dueAt: string | null;
  completedAt: string | null;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  createdAt: string;
  latestComment?: TaskComment;
  locationGroup?: {
    id: number | string;
    name: string;
  } | null;
}

export interface TaskComment {
  id: number;
  body: string;
  author: TaskUser;
  createdAt: string;
}

export interface TaskAttachment {
  id: number;
  url: string;
  label: string | null;
  uploadedBy?: TaskUser;
  createdAt: string;
}

export interface ContactActivity {
  id: number;
  type: string;
  summary: string;
  occurredAt: string;
  recordedBy?: { username: string };
  referenceTable: string | null;
  referenceId: number | null;
  createdAt: string;
}

export interface RetentionSummary {
  recorded: number;
  retained: number;
  joinedFellowship: number;
  joinedServingTeam: number;
  baptised: number;
}

export interface RetentionMonthData {
  month: number;
  monthName: string;
  totalNewContacts: number;
  successfulCallsMade: number;
  wantToJoinMC: number;
  servingTeam: number;
  teaHangout: number;
  baptism: number;
}

export interface RetentionReport {
  year: number;
  months: RetentionMonthData[];
}

export interface RetentionWeekData {
  weekStart: string;
  label: string;
  totalNewContacts: number;
  successfulCallsMade: number;
  wantToJoinMC: number;
  servingTeams: number;
  teaHangout: number;
  baptism: number;
}

export interface RetentionWeekReport {
  year: number;
  weeks: RetentionWeekData[];
}

export interface TaskFilters {
  status?: TaskStatus[];
  type?: TaskType[];
  assignedToId?: number | 'unassigned';
  locationGroupIds?: number[];
  page?: number;
  limit?: number;
}
