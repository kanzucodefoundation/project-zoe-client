import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { ListItem, List, ListItemText } from '@material-ui/core';
import { remoteRoutes } from '../../data/constants';
import { get } from '../../utils/ajax';
import Layout from '../../components/layout/Layout';
import { IReport, IReportColumn } from './types';
import ReportSubmissions from './ReportSubmissions';
import ReportDetail from './ReportDetail';
import Loading from '../../components/Loading';

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

const ReportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<IReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [isViewingReportSubmissions, setIsViewingReportSubmissions] = useState<boolean>(false);
  const [reportFields, setReportFields] = useState<IReportColumn[]>([]);
  const classes = useStyles();

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
    get(
      `${remoteRoutes.reports}/${report.id}`,
      (response: any) => {
        if (Array.isArray(response.fields)) {
          setReportFields(response.fields);
          setSelectedReport({ id: report.id, name: report.name });
        } else {
          console.error('Failed to fetch report fields');
        }
      },
      (error) => console.error('Failed to fetch report fields', error),
    );
  };

  const handleViewSubmissions = async (report: IReport) => {
    setSelectedReport({ id: report.id, name: report.name });
    setIsViewingReportSubmissions(true);
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setReportFields([]);
    setIsViewingReportSubmissions(false);
  };

  if (loading) {
    return <Loading />;
  }

  if (selectedReport && isViewingReportSubmissions) {
    return (
      <Layout>
        <div className={classes.root}>
          <ReportSubmissions report={selectedReport} onBackToList={handleBackToList} />
        </div>
      </Layout>
    );
  }

  if (selectedReport) {
    return (
      <Layout>
        <div className={classes.root}>
          <ReportDetail report={selectedReport} reportFields={reportFields} onBackToList={handleBackToList} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={classes.root}>
        <Typography variant="button" className={classes.title}>
          Report List
        </Typography>
        <Box mt={2} className={classes.reportList}>
          <List>
            {reports.map((report) => (
              <ListItem key={report.id} className={classes.listItem}>
                <ListItemText primary={report.name} />
                <div className={classes.buttonContainer}>
                  <Button variant="contained" color="primary" onClick={() => handleSubmitReport(report)}>
                    Submit Report
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewSubmissions(report)}
                  >
                    View Submissions
                  </Button>
                </div>
              </ListItem>
            ))}
          </List>
        </Box>
      </div>
    </Layout>
  );
};

export default ReportPage;
