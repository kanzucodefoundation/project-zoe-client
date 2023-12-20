// src/models/StatusChangeLogModel.ts
import { v4 as uuidv4 } from 'uuid';

export interface StatusChangeLog {
  userId: string;
  oldStatus: string;
  newStatus: string;
  timeOfChange: Date;
}

export function createStatusChangeLog(
  userId: string,
  oldStatus: string,
  newStatus: string,
  timeOfChange: Date,
): StatusChangeLog {
  return {
    userId,
    oldStatus,
    newStatus,
    timeOfChange,
  };
}
