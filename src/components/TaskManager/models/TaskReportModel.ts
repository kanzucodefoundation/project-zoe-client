// TaskReportModel.ts
import { v4 as uuidv4 } from 'uuid';

export interface TaskReport {
  submittedBy: string;
  taskId: string;
  reportDetail: string;
  reportAttachment: string;
  submittedOn: string;
}

export function createTaskReport(
  submittedBy: string,
  taskId: string,
  reportDetail: string,
  reportAttachment: string,
  submittedOn: string,
): TaskReport {
  return {
    submittedBy,
    taskId,
    reportDetail,
    reportAttachment,
    submittedOn,
  };
}
