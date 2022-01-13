import * as React from 'react';
import Navigation from '../../components/layout/Layout';
import Grid from '@material-ui/core/Grid';
import Tags from './tags/Tags';
import PasswordReset from './PasswordReset';
import Divider from '@material-ui/core/Divider';
import ReportCategories from '../admin/reports/reportCategories';

const Settings = () => {
  return (
    <Navigation>
      <Grid spacing={2} container>
        {/* <Grid item xs={12} md={12}>
          <ReportCategories />
        </Grid> */}
        <Grid item xs={12} md={6} xl={3}>
          <PasswordReset />

          <Divider />
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Tags />
        </Grid>
      </Grid>
    </Navigation>
  );
};

export default Settings;
