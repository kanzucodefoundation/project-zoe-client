//StatusChangeLogList.tsx
import React from 'react';
import { StatusChangeLog } from './models/StatusChangeLogModel';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Theme,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

interface StatusChangeLogListProps {
  statusChangeLogs: StatusChangeLog[];
}

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontWeight: 500,
  },
}));

const StatusChangeLogList: React.FC<StatusChangeLogListProps> = ({
  statusChangeLogs,
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
        STATUS CHANGE LOG
      </Typography>
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
