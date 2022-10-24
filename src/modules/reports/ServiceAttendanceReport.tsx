import React, { Fragment, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import {  useDispatch, useSelector } from 'react-redux';
import XTable from '../../components/table/XTable';
import { XHeadCell } from '../../components/table/XTableHead';
import Loading from '../../components/Loading';
import { IMobileRow } from '../../components/DataList';
import PersonAvatar from '../../components/PersonAvatar';
import ListHeader from '../../components/ListHeader';
import { IEvent } from '../events/types';
import {  IEventState } from '../../data/events/eventsReducer';
import { IReportState, reportsConstants } from '../../data/reports/reducer';
import { remoteRoutes } from '../../data/constants';
import { search } from '../../utils/ajax';
import { ReportProps } from './types';

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



const ServiceAttendanceReport = (reportProps: ReportProps) => {
  const { reportName = 'service-attendance'} = reportProps;
  const dispatch = useDispatch();
  const [filter, setFilter] = useState<any>({ limit: 5000 });
  const classes = useStyles();
  const { data, loading }: IReportState = useSelector(
    (state: any) => state.reports,
  );

  const toMobileRow = (data: IEvent): IMobileRow => ({
    avatar: <PersonAvatar data={data} />,
    primary: reportName,
    secondary: (
        <>
        </>
    ),
  });


  useEffect(() => {
    dispatch({
      type: reportsConstants.reportsFetchLoading,
      payload: true,
    });
    search(
      `${remoteRoutes.reports}/${reportName}`,
      filter,
      (resp) => {
        dispatch({
          type: reportsConstants.reportsFetchOne,
          payload: resp,
        });
      },
      undefined,
      () => {
        dispatch({
          type: reportsConstants.reportsFetchLoading,
          payload: false,
        });
      },
    );
  }, [filter, dispatch]);  

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
            {loading || !data.metadata ? (
              <Loading />
            ) : (
              
              <XTable
                headCells={data.metadata.columns}
                data={data.data}
                initialRowsPerPage={10}
                initialSortBy="name"
              />
            )}
          </Box>
        </Hidden>
        <Hidden mdUp>
          <List>
            {loading || ! data?.data ? (
              <Loading />
            ) : (
              data.data.map((row: any) => {
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
