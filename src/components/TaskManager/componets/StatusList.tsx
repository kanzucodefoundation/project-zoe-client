// src/components/StatusList.tsx
import React from 'react';
import { Status } from '../models/StatusModel';
import { List, ListItem, ListItemText } from '@material-ui/core';

interface StatusListProps {
  statuses: Status[];
}

const StatusList: React.FC<StatusListProps> = ({ statuses }) => {
  return (
    <div>
      <h2>Status List</h2>
      <List>
        {statuses.map((status) => (
          <ListItem key={status.id}>
            <ListItemText primary={`Name: ${status.name}`} />
            <ListItemText primary={`Description: ${status.description}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default StatusList;
