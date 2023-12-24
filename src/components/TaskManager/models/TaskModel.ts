//TaskModel.ts
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  requireReport: boolean;
  reportDueDate: Date;
}

export function createTask(
  name: string,
  description: string,
  dueDate: Date,
  requireReport: boolean,
  reportDueDate: Date,
): Task {
  return {
    id: uuidv4(),
    name,
    description,
    dueDate,
    requireReport,
    reportDueDate,
  };
}
