//TaskModel.ts
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  name: string;
  description: string;
  date: string;
  assignee: string;
}

export function createTask(
  name: string,
  description: string,
  date: string,
  assignee: string,
): Task {
  return {
    id: uuidv4(),
    name,
    description,
    date,
    assignee,
  };
}
