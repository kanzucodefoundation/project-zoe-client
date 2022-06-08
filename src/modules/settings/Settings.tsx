import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Navigation from '../../components/layout/Layout';
import Tags from './tags/Tags';
import PasswordReset from './PasswordReset';

const Settings = () => (
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

export default Settings;
