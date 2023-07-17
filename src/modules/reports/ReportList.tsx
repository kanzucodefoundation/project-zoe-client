import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { ListItem, List, ListItemText } from '@material-ui/core';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { get } from '../../utils/ajax';
import Layout from '../../components/layout/Layout';
import { IReport } from './types';
import Loading from '../../components/Loading';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import { useSelector } from 'react-redux';
import { IState } from '../../data/types';
import { useHistory } from 'react-router';
import Toast from '../../utils/Toast';
import XBreadCrumbs from '../../components/XBreadCrumbs';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  reportList: {
    marginTop: theme.spacing(2),
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    marginLeft: theme.spacing(2),
  },
}));

const ReportList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<IReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [isViewingReportSubmissions, setIsViewingReportSubmissions] = useState<boolean>(false);
  const [reportFields, setReportFields] = useState<IReportField[]>([]);
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const history = useHistory();

  useEffect(() => {
    const fetchReports = async () => {
      get(
        remoteRoutes.reports,
        (response: any) => {
          setReports(response);
        },
        (error: any) => console.error('Failed to fetch reports', error),
        () => setLoading(false),
      );
    };

    fetchReports();
  }, []);

  const handleSubmitReport = async (report: IReport) => {
    history.push(`${localRoutes.reports}/${report.id}/submit`);
  };

  const handleViewSubmissions = async (report: IReport) => {
    history.push(`${localRoutes.reports}/${report.id}/submissions`);
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setReportFields([]);
    setIsViewingReportSubmissions(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout title='Report List'>
      <Box className={classes.root}>
        <Box pb={2}>
          <XBreadCrumbs
            title="Reports"
            paths={[
              {
                path: localRoutes.home,
                label: 'Dashboard',
              }
            ]}
          />
        </Box>
        <Box mt={2} className={classes.reportList}>
          <List>
            {reports.map((report) => (
              <ListItem key={report.id} alignItems="flex-start" disableGutters>
                <ListItemText primary={report.name} />
                <div className={classes.buttonContainer}>
                  <Button 
                    variant="outlined"
                    color="primary"
                    onClick={() => handleSubmitReport(report)}>
                    Submit Report
                  </Button>
                  {user.roles.includes('RoleAdmin') && (
                    <IconButton
                      size="medium"
                      color="primary"
                      aria-label="edit"
                      component="span"
                      onClick={() => handleViewSubmissions(report)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  )}
                </div>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Layout>
  );
};

export default ReportList;
