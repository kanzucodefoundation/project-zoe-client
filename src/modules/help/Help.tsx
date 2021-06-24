import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import React from "react";
import XBreadCrumbs from "../../components/XBreadCrumbs";
import { localRoutes } from "../../data/constants";
import Layout from "./../../components/layout/Layout";
import YouTube from "react-youtube";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(1),
      },
    },
    video: {
      width: "100%",
    },
  })
);

const Help = () => {
  const classes = useStyles();
  const videos = [
    {
      id: "q0G3pAVD2Zg",
      title:
        "How to register as a visitor and approve members as an administrator.",
    },
    {
      id: "PtRNvkcFBP0",
      title: "How to manage your personal details",
    },
    {
      id: "gqKYO5XAb38",
      title: "How to manage group details and add, edit and remove members",
    },
    {
      id: "yvDth5gPrxk",
      title: "How to upload a list of members using a csv file",
    },
  ];
  return (
    <Layout>
      <Box className={classes.root}>
        <Box pb={2}>
          <XBreadCrumbs
            title="Help Center"
            paths={[
              {
                path: localRoutes.home,
                label: "Dashboard",
              },
            ]}
          />
        </Box>
        <Typography variant="h5">Tutorial Videos</Typography>
        <Box pt={2}>
          <Grid container spacing={4}>
            {videos.map((it) => (
              <Grid item xs={12} md={6} key={it.id}>
                <YouTube videoId={it.id} id={it.id} className={classes.video} />
                <br />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Layout>
  );
};

export default Help;
