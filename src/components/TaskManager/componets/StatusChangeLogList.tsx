// src/components/StatusChangeLogList.tsx
import React from 'react';
import { StatusChangeLog } from '../models/StatusChangeLogModel';
import { List, ListItem, ListItemText } from '@material-ui/core';

interface StatusChangeLogListProps {
  statusChangeLogs: StatusChangeLog[];
}

const StatusChangeLogList: React.FC<StatusChangeLogListProps> = ({
  statusChangeLogs,
}) => {
  return (
    <div>
      <h2>Status Change Log</h2>
      <List>
        {statusChangeLogs.map((log) => (
          <ListItem key={`${log.userId}-${log.timeOfChange.toISOString()}`}>
            <ListItemText primary={`User ID: ${log.userId}`} />
            <ListItemText primary={`Old Status: ${log.oldStatus}`} />
            <ListItemText primary={`New Status: ${log.newStatus}`} />
            <ListItemText
              primary={`Time of Change: ${log.timeOfChange.toDateString()}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default StatusChangeLogList;
