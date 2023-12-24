//StatusModel.ts
import { v4 as uuidv4 } from 'uuid';

export interface Status {
  id: string;
  name: string;
  description: string;
}

export function createStatus(name: string, description: string): Status {
  return {
    id: uuidv4(),
    name,
    description,
  };
}
