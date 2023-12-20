// src/components/TaskReportList.tsx
import React from 'react';
import { TaskReport } from '../models/TaskReportModel';
import { List, ListItem, ListItemText, Button } from '@material-ui/core';

interface TaskReportListProps {
  taskReports: TaskReport[];
}

const TaskReportList: React.FC<TaskReportListProps> = ({ taskReports }) => {
  const handleDownload = async (attachment: string, reportDetail: string) => {
    try {
      // Make a network request to fetch the file
      const response = await fetch(attachment);
      const blob = await response.blob();

      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = reportDetail;

      // Append the link to the document and trigger a click
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Clean up: remove the link from the document
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error('Error downloading file:', error);
      // You may want to add error handling logic here
    }
  };

  return (
    <div>
      <h2>Task Reports</h2>
      <List>
        {taskReports.map((report) => (
          <ListItem
            key={`${report.taskId}-${report.submittedOn.toISOString()}`}
          >
            <ListItemText primary={`Submitted by: ${report.submittedBy}`} />
            <ListItemText primary={`Task ID: ${report.taskId}`} />
            <ListItemText primary={`Report Detail: ${report.reportDetail}`} />
            <ListItemText
              primary={`Submitted on: ${report.submittedOn.toDateString()}`}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={() =>
                handleDownload(report.reportAttachment, report.reportDetail)
              }
            >
              Download Report
            </Button>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default TaskReportList;
