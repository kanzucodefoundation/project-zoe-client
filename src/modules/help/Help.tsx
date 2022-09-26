import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import Grid from '@material-ui/core/Grid';
import { get } from '../../utils/ajax';
import XBreadCrumbs from '../../components/XBreadCrumbs';
import { localRoutes, remoteRoutes } from '../../data/constants';
import Layout from '../../components/layout/Layout';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    width: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(1),
    },
  },
  video: {
    width: '100%',
  },
}));

interface IFile {
  id?: string;
  title?: string;
}

const Help = () => {
  const classes = useStyles();

  const [file, setFile] = useState<IFile[]>([]);

  const getHelp = async () => {
    try {
      await get(
        `${remoteRoutes.help}`,
        (data) => {
          const files: IFile[] = [];
          for (let i = 0; i < data.length; i++) {
            const doc = {
              id: data[i].url,
              title: data[i].title,
            };
            files.push(doc);
          }
          setFile(files);
          return new Promise((data) => setTimeout(data, 5000));
        },
      );
      return await new Promise((data) => setTimeout(data, 5000));
    } catch (error) {
    }
  };
  useEffect(
    () => {
      getHelp();
    },
    [],
  );

  return (
    <Layout>
      <Box className={classes.root}>
        <Box pb={2}>
          <XBreadCrumbs
            title="Help Center"
            paths={[
              {
                path: localRoutes.home,
                label: 'Dashboard',
              },
            ]}
          />
        </Box>
        <Typography variant="h5">Tutorial Videos</Typography>
        <Box pt={2}>
          <Grid container spacing={4}>
            {file.map((it) => (
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
