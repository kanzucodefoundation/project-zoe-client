// src/components/TaskAssignmentList.tsx
import React from 'react';
import { TaskAssignment } from '../models/TaskAssignmentModel';
import { List, ListItem, ListItemText } from '@material-ui/core';

interface TaskAssignmentListProps {
  taskAssignments: TaskAssignment[];
}

const TaskAssignmentList: React.FC<TaskAssignmentListProps> = ({
  taskAssignments,
}) => {
  return (
    <div>
      <h2>Task Assignments</h2>
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
