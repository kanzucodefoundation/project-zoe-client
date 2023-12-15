import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import React, { useState } from 'react';
import EditDialog from '../../../components/EditDialog';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';
import { del } from '../../../utils/ajax';
import TaskApp from './TaskApp';
import Layout from '../../../components/layout/Layout';
import List from './List1/List';
import List2 from './List2/List2';
import List3 from './List3/List3';

const TaskManagement = (data: any) => {
  return (
    <Layout>
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="button" component="div">
              Task Management
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <div className="card">
              <List />
              <List2 />
              <List3 />
            </div>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default TaskManagement;
