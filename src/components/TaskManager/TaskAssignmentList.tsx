//TaskAssignmentList.tsx
import React from 'react';
import { TaskAssignment } from './models/TaskAssignmentModel';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Theme,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

interface TaskAssignmentListProps {
  taskAssignments: TaskAssignment[];
}

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontWeight: 500,
  },
}));

const TaskAssignmentList: React.FC<TaskAssignmentListProps> = ({
  taskAssignments,
}) => {
  const classes = useStyles();

  return (
    <div>
      <Typography
        className={classes.title}
        color="textSecondary"
        gutterBottom
        variant="body2"
      >
        TASK ASSIGNMENTS
      </Typography>
      <List>
        {taskAssignments.map((assignment) => (
          <ListItem
            key={`${assignment.taskId}-${assignment.assignedOn.toISOString()}`}
          >
            <ListItemText primary={`Assigned to: ${assignment.assignedTo}`} />
            <ListItemText primary={`Task ID: ${assignment.taskId}`} />
            <ListItemText
              primary={`Assigned on: ${assignment.assignedOn.toDateString()}`}
            />
            <ListItemText
              primary={`Due Date: ${assignment.dueDate.toDateString()}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default TaskAssignmentList;
