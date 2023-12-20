// src/components/TaskReportList.tsx
import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { TaskReport } from './models/TaskReportModel';
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Theme,
} from '@material-ui/core';

interface TaskReportListProps {
  taskReports: TaskReport[];
}

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontWeight: 500,
  },
}));

const TaskReportList: React.FC<TaskReportListProps> = ({ taskReports }) => {
  const classes = useStyles();

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
      <Typography
        className={classes.title}
        color="textSecondary"
        gutterBottom
        variant="body2"
      >
        TASK REPORTS
      </Typography>
      <List>
        {taskReports.map((report) => (
          <ListItem
            key={`${report.taskId}-${report.submittedOn.toISOString()}`}
          >
            <ListItemText primary={`Submitted by: ${report.submittedBy}`} />
            <ListItemText primary={`Task: ${report.taskId}`} />
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
