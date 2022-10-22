import React, { Fragment, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import {  useSelector } from 'react-redux';
import XTable from '../../components/table/XTable';
import { XHeadCell } from '../../components/table/XTableHead';
import Loading from '../../components/Loading';
import { IMobileRow } from '../../components/DataList';
import PersonAvatar from '../../components/PersonAvatar';
import ListHeader from '../../components/ListHeader';
import { IEvent } from '../events/types';
import {  IEventState } from '../../data/events/eventsReducer';

const reportData = {
  metadata: {
      "name": "service-attendance",
      "groupBy": [
          "startdatetime"
      ],
      "start": "2022-03-18T00:00:00Z",
      "end": "2022-03-19T00:00:00Z",
      "rowCount": 5,
      "filters": [],
      columns: [
          {
              name: "location",
              label: "Location"
          },
          {
              name: "october22022",
              label: "2 October 2022"
          },
          {
              name: "october92022",
              label: "9 October 2022"
          },
          {
              name: "october162022",
              label: "16 Oct 2022"
          },
          {
              name: "october232022",
              label: "23 Oct 2022"
          },
          {
              name: "average",
              label: "Average"
          }
      ]
  },
  data: [
      {
          location: "WHNaalya",
          'october22022': "1396",
          'october92022': "1547",
          'october162022': "1527",
          'october232022': "1527",
          average: "1490"
      },
      {
          "location": "WHKBD",
          "october22022": "333",
          "october92022": "1233",
          "october162022": "344",
          "october232022": "1527",
          "average": "122"
      },
      {
          "location": "WHDTN",
          "october22022": "3444",
          "october92022": "1222",
          "october162022": "4444",
          "october232022": "1527",
          "average": "223"
      }

  ],
  "summaryStatistics": {
      "location": {
          "value": "",
          "details": {}
      },
      "october22022": {
          "value": "300",
          "details": {}
      },
      "october92022": {
          "value": "400",
          "details": {}
      },
      "october162022": {
          "value": "200",
          "details": {}
      },
      "october232022": {
          "value": "200",
          "details": {}
      },
      "average": {
          "value": "800",
          "details": {}
      }
  }
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  filterPaper: {
    borderRadius: 0,
    padding: theme.spacing(2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const headCells: XHeadCell[] = reportData.metadata.columns

const toMobileRow = (data: IEvent): IMobileRow => ({
  avatar: <PersonAvatar data={data} />,
  primary: reportData.metadata.name,
  secondary: (
      <>
      </>
  ),
});

const ServiceAttendanceReport = () => {
  const [filter, setFilter] = useState<any>({ limit: 5000 });
  const classes = useStyles();
  const { data, loading }: IEventState = useSelector(
    (state: any) => state.events,
  );

  return (
    <>
      <Box p={1} className={classes.root}>
        <ListHeader
          title="Service Attendance Reports"
          onFilter={setFilter}
          filter={filter}
          showBreadCrumbs={false}
          enableFiltering={false}
          loading={loading}
        />
        <Hidden smDown>
          <Box pt={1}>
            {loading ? (
              <Loading />
            ) : (
              <XTable
                headCells={headCells}
                data={reportData.data}
                initialRowsPerPage={10}
                initialSortBy="name"
              />
            )}
          </Box>
        </Hidden>
        <Hidden mdUp>
          <List>
            {loading ? (
              <Loading />
            ) : (
              reportData.data.map((row: any) => {
                const mobileRow = toMobileRow(row);
                return (
                  <Fragment key={row.location}>
                    <ListItem
                      alignItems="flex-start"
                      button
                      disableGutters
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
    </>
  );
};

export default ServiceAttendanceReport;
