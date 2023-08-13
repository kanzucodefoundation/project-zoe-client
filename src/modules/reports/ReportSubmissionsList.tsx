import React, { Fragment, useEffect, useState } from 'react';
import {
  createStyles, Button, makeStyles, Theme, Typography,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
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
import EventsFilter from '../events/EventsFilter';
import PDateInput from '../../components/plain-inputs/PDateInput';
import { useFilter } from '../../utils/fitlerUtilities';

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

const initialData: any = {
  query: '',
  groupIdList: [],
  categoryIdList: [],
  from: `${format(new Date(startPeriod), 'PP')}`,
  to: `${format(new Date(endPeriod), 'PP')}`,
  limit: 200,
  skip: 0,
};

const ReportSubmissions = () => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState<any>({ limit: 5000 });
  const classes = useStyles();
  const history = useHistory();
  const { reportId } = useParams<any>();
  const { handleDateChange } = useFilter({
    initialData,
    onFilter,
    comboFields: ['categoryIdList', 'groupIdList'],
  });

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
          filterComponent={<EventsFilter onFilter={setFilter} />}
          showBreadCrumbs={false}
          enableFiltering={false}
          loading={loading}
        />
          <PDateInput
            name="from"
            value={data.from}
            onChange={(value) => handleDateChange('from', value)}
            label="From"
            inputVariant="outlined"
          />
          <Box pt={1}>
            {loading || !data.data ? (
              <Loading />
            ) : (

              <XTable
                headCells={data.columns || []}
                data={data.data || []}
                initialRowsPerPage={200}
                usePagination={true}
                handleSelection={handleRowSelection}
                initialSortBy="smallGroupName"
              />
            )}
          </Box>
      </Box>
    </Layout>
  );
};

export default ReportSubmissions;
