// src/models/TaskAssignmentModel.ts
import { v4 as uuidv4 } from 'uuid';

export interface TaskAssignment {
  assignedTo: string;
  taskId: string;
  assignedOn: Date;
  dueDate: Date;
}

export function createTaskAssignment(
  assignedTo: string,
  taskId: string,
  assignedOn: Date,
  dueDate: Date,
): TaskAssignment {
  return {
    assignedTo,
    taskId,
    assignedOn,
    dueDate,
  };
}
