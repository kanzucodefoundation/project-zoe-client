import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { Grid } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { format, lastDayOfWeek, startOfWeek } from "date-fns";
import Loading from "../../components/Loading";
import DashboardData from "./DashboardData";
import { addDays } from "date-fns/esm";
import { search } from "../../utils/ajax";
import { remoteRoutes } from "../../data/constants";

const Dashboard = () => {
  const today = new Date();
  const lastWeekDate = addDays(today, -7);
  const startPeriod = startOfWeek(today);
  const endPeriod = lastDayOfWeek(today);
  const [currWeek, setCurrWeek] = useState<any[]>([]);
  const [prevWeek, setPrevWeek] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currFilter = {
    from: format(startPeriod, "yyyy-MM-dd"),
    to: format(endPeriod, "yyyy-MM-dd"),
  };
  const prevFilter = {
    from: format(startOfWeek(lastWeekDate), "yyyy-MM-dd"),
    to: format(lastDayOfWeek(lastWeekDate), "yyyy-MM-dd"),
  };

  useEffect(() => {
    setLoading(true);

    search(remoteRoutes.eventsMetricsRaw, currFilter, (resp) => {
      setCurrWeek(resp);
    });

    search(remoteRoutes.eventsMetricsRaw, prevFilter, (resp) => {
      setPrevWeek(resp);
    });

    setLoading(false);
  }, [currFilter.from, currFilter.to]);

  return (
    <Layout>
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="button" component="div">
              Dashboard
            </Typography>
            <Typography variant="caption" component="div">
              Here's what's happening
            </Typography>
            <Typography variant="overline" component="div">
              {`${format(new Date(startPeriod), "PP")} - ${format(
                new Date(endPeriod),
                "PP"
              )}`}
            </Typography>
          </Grid>
          {loading ? (
            <Loading />
          ) : (
            <DashboardData
              currWeekEvents={currWeek}
              prevWeekEvents={prevWeek}
            />
          )}
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
