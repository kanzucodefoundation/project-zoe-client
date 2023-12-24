//StatusList.tsx
import React from 'react';
import { Status } from './models/StatusModel';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Theme,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

interface StatusListProps {
  statuses: Status[];
}

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontWeight: 500,
  },
}));

const StatusList: React.FC<StatusListProps> = ({ statuses }) => {
  const classes = useStyles();

  return (
    <div>
      <Typography
        className={classes.title}
        color="textSecondary"
        gutterBottom
        variant="body2"
      >
        STATUS LIST
      </Typography>
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
