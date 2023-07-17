import React, { Fragment, useEffect, useState } from 'react';
import {
  createStyles, Button, makeStyles, Theme, Typography,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { useDispatch, useSelector } from 'react-redux';
import XTable from '../../components/table/XTable';
import Loading from '../../components/Loading';
import { IMobileRow } from '../../components/DataList';
import PersonAvatar from '../../components/PersonAvatar';
import ListHeader from '../../components/ListHeader';
import { IEvent } from '../events/types';
import { IReportState, reportsConstants } from '../../data/reports/reducer';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { search } from '../../utils/ajax';
import { useHistory, useParams } from 'react-router';
import Layout from '../../components/layout/Layout';
import XBreadCrumbs from '../../components/XBreadCrumbs';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    marginBottom: theme.spacing(2),
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

const ReportSubmissions = () => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState<any>({ limit: 5000 });
  const classes = useStyles();
  const history = useHistory();
  const { reportId } = useParams<any>();

  const { data, loading }: IReportState = useSelector(
    (state: any) => state.reports,
  );

  const handleRowSelection = (reportSubmissionId: string) => {
    history.push(`${localRoutes.reports}/${reportId}/submissions/${reportSubmissionId}`);
  };
  
  const toMobileRow = (personData: IEvent): IMobileRow => ({
    avatar: <PersonAvatar data={personData} />,
    primary: 'Report',
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
      `${remoteRoutes.reports}/${reportId}/submissions`,
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
    <Layout title='Report Submissions'>
      <Box p={1} className={classes.root}>
        <Box pb={2}>
            <XBreadCrumbs
              title="Report Submissions"
              paths={[
                {
                  path: localRoutes.home,
                  label: 'Dashboard',
                },
                {
                  path: localRoutes.reports,
                  label: 'Reports',
                }
              ]}
            />
          </Box>
        <ListHeader
          title="Report Submissions"
          onFilter={setFilter}
          filter={filter}
          showBreadCrumbs={false}
          enableFiltering={false}
          loading={loading}
        />
        <Hidden smDown>
          <Box pt={1}>
            {loading || !data.data ? (
              <Loading />
            ) : (

              <XTable
                headCells={data.columns || []}
                data={data.data || []}
                initialRowsPerPage={10}
                handleSelection={handleRowSelection}
                initialSortBy="smallGroupName"
              />
            )}
          </Box>
        </Hidden>
        <Hidden mdUp>
          <List>
            {loading || !data?.data ? (
              <Loading />
            ) : (
              data.data.map((row: any) => {
                const mobileRow = toMobileRow(row);
                return (
                  <Fragment key={row.id}>
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
    </Layout>
  );
};

export default ReportSubmissions;
