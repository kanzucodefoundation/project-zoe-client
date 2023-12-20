// src/components/TaskList.tsx
import React from 'react';
import { Task } from './models/TaskModel';
import { List, ListItem, ListItemText } from '@material-ui/core';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <div>
      <List>
        {tasks?.map((task) => (
          <ListItem key={task.id}>
            <ListItemText primary={task.name} secondary={task.description} />
            <ListItemText
              primary={`Due Date: ${task.dueDate.toDateString()}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default TaskList;
