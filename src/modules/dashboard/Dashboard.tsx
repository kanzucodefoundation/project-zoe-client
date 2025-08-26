import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {
  differenceInDays,
  format,
  lastDayOfWeek,
  startOfWeek,
  subDays,
} from 'date-fns';
import Loading from '../../components/Loading';
import DashboardData from './DashboardData';
import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import DashboardFilter from './DashboardFilter';
import { IInterval } from '../events/types';

const Dashboard = () => {
  const today = new Date();
  const startPeriod = startOfWeek(today);
  const endPeriod = lastDayOfWeek(today);
  const [currData, setCurrData] = useState<any[]>([]);
  const [prevData, setPrevData] = useState<any[]>([]);
  const [interval, setInterval] = useState<IInterval>();
  const [loading, setLoading] = useState<boolean>(true);
  const currFilter = {
    from: format(startPeriod, 'yyyy-MM-dd'),
    to: format(endPeriod, 'yyyy-MM-dd'),
  };
  const [filter, setFilter] = useState<any>({
    from: currFilter.from,
    to: currFilter.to,
    limit: 5000,
  });

  useEffect(() => {
    setLoading(true);
    search(remoteRoutes.eventsMetricsRaw, filter, (resp) => {
      setCurrData(resp);
    });

    const d = differenceInDays(new Date(filter.to), new Date(filter.from));
    const prevTo = subDays(new Date(filter.from), 1);
    const prevFrom = subDays(prevTo, d);

    const prevFilter = {
      from: format(prevFrom, 'yyyy-MM-dd'),
      to: format(prevTo, 'yyyy-MM-dd'),
      groupIdList: filter.groupIdList,
    };
    setInterval({
      from: format(prevFrom, 'dd/MM'),
      to: format(prevTo, 'dd/MM'),
    });

    search(remoteRoutes.eventsMetricsRaw, prevFilter, (resp) => {
      setPrevData(resp);
    });
    setLoading(false);
  }, [filter]);

  return (
    <Layout>
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="button" component="div">
              Dashboard
            </Typography>
            <Typography
              variant="caption"
              component="div"
              style={{ marginBottom: '10px' }}
            >
              Here's what's happening
            </Typography>
            <DashboardFilter onFilter={setFilter} />
          </Grid>
          {loading ? (
            <Loading />
          ) : (
            <DashboardData
              currDataEvents={currData}
              prevDataEvents={prevData}
              interval={interval}
            />
          )}
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
