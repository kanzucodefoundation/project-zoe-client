import {
  Box,
  createStyles,
  Divider,
  Grid,
  Hidden,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React, { Fragment } from 'react';
import { useHistory } from 'react-router';
import { Alert } from '@material-ui/lab';
import { IMobileRow } from '../../components/DataList';
import PersonAvatar from '../../components/PersonAvatar';
import { XHeadCell } from '../../components/table/XTableHead';
import { printDate } from '../../utils/dateHelpers';
import EventLink from '../events/EventLink';
import { IEvent } from '../events/types';
import XTable from '../../components/table/XTable';
import { localRoutes } from '../../data/constants';

const useStyles = makeStyles(() => createStyles({
  root: {
    width: '100%',
  },
}));

interface IProps {
  reports: any[];
}

const headCells: XHeadCell[] = [
  {
    name: 'id',
    label: 'Name',
    render: (value, rec) => <EventLink id={value} name={rec.name} />,
  },
  { name: 'category.name', label: 'Category' },
  { name: 'startDate', label: 'Start Date', render: printDate },
  { name: 'attendance.length', label: 'Attendance' },
];

const toMobileRow = (data: IEvent): IMobileRow => ({
  avatar: <PersonAvatar data={data} />,
  primary: data.name,
  secondary: (
      <>
        <Typography variant="caption" color="textSecondary" display="block">
          {data.category.name}: {printDate(data.startDate)}
        </Typography>
      </>
  ),
});

const GroupEventsList = ({ reports }: IProps) => {
  const classes = useStyles();
  const history = useHistory();

  const handleItemClick = (id: string) => () => {
    history.push(`${localRoutes.events}/${id}`);
  };

  return (
    <Grid container>
      <Box p={1} className={classes.root}>
        <Hidden smDown>
          <Box pt={1}>
            {reports.length === 0 ? (
              <ListItem>
                <Alert severity="info" style={{ width: '100%' }}>
                  No events to display
                </Alert>
              </ListItem>
            ) : (
              <XTable
                headCells={headCells}
                data={reports}
                initialRowsPerPage={10}
                initialSortBy="name"
                handleSelection={handleItemClick}
              />
            )}
          </Box>
        </Hidden>
        <Hidden mdUp>
          <List>
            {reports.length === 0 ? (
              <ListItem>
                <Alert severity="info" style={{ width: '100%' }}>
                  No events to display
                </Alert>
              </ListItem>
            ) : (
              reports.map((row: any) => {
                const mobileRow = toMobileRow(row);
                return (
                  <Fragment key={row.id}>
                    <ListItem
                      alignItems="flex-start"
                      button
                      disableGutters
                      onClick={handleItemClick(row.id)}
                    >
                      <ListItemAvatar>{mobileRow.avatar}</ListItemAvatar>
                      <ListItemText
                        primary={mobileRow.primary}
                        secondary={mobileRow.secondary}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </Fragment>
                );
              })
            )}
          </List>
        </Hidden>
      </Box>
    </Grid>
  );
};

export default GroupEventsList;
