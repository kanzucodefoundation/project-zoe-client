import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { remoteRoutes } from '../../data/constants';
import { get } from '../../utils/ajax';
import Loading from '../../components/Loading';
import ReportForm from './ReportFormSubmit';
import Layout from '../../components/layout/Layout';
import { ListItem, List, ListItemText } from '@material-ui/core';
import { IReportColumn, ReportProps } from './types';
import ServiceAttendanceReport from './ServiceAttendanceReport';

 
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    title: {
      marginBottom: theme.spacing(2),
    },
    reportList: {
      marginTop: theme.spacing(2),
    },
    reportItem: {
      cursor: 'pointer',
      marginBottom: theme.spacing(1),
    },
    buttonContainer: {
        marginLeft: theme.spacing(2),
    },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    
  })
);

interface Report {
  id: number;
  title?: string;
  name?: string;
}

const ReportDetail: React.FC<{ reportId: number; reportFields: IReportColumn[]; onBackToList: () => void }> = ({
  reportId,
  reportFields,
  onBackToList,
}) => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h4" className={classes.title}>
        Report Submission
      </Typography>
      <Box mt={2}>
        <Typography variant="subtitle1">
          Report ID: {reportId}
        </Typography>
      </Box>
      <Box mt={2}>
        <button onClick={onBackToList}>Back to Report List</button>
      </Box>
      <Box mt={2}>
        {reportFields.length > 0 ? (
          <ReportForm reportId={reportId.toString()} fields={reportFields} />
        ) : (
          <Loading />
        )}
      </Box>
    </>
  );
};

const ReportPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportSubmissions, setReportSubmissions] = useState<any[]>([]); //@TODO Fix Any
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [selectedReportName, setSelectedReportName] = useState<string | null>(null);
  const [isViewingReportSubmissions, setIsViewingReportSubmissions] = useState<boolean>(false);
  const [reportFields, setReportFields] = useState<IReportColumn[]>([]);
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    const fetchReports = async () => {
      get(
        remoteRoutes.reports,
        (response: any) => {
          setReports(response);
        },
        (error: any) => console.error('Failed to fetch reports', error),
        () => setLoading(false)
      );
    };

    fetchReports();
  }, []);

  const handleSubmitReport = async (reportId: number) => {
    get(
      `${remoteRoutes.reports}/${reportId}`,
      (response: any) => {
        if (Array.isArray(response.fields)) {
          setReportFields(response.fields);
          setSelectedReport(reportId);
        } else {
          console.error('Failed to fetch report fields');
        }
      },
      (error) => console.error('Failed to fetch report fields', error)
    );
  };

  const handleViewSubmissions = async (reportId: number, reportName: string) => {
    get(
      `${remoteRoutes.reports}/${reportId}/submissions`,
      (response: any) => {
        if (Array.isArray(response.data)) {
          setReportSubmissions(response.data);
          setSelectedReport(reportId);
          setIsViewingReportSubmissions(true);
          setSelectedReportName(reportName);
        } else {
          console.error('Failed to fetch report submissions');
        }
      },
      (error) => console.error('Failed to fetch report submissions', error)
    );
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setReportFields([]);
  };



  if (loading) {
    return <Loading />;
  }

  if (selectedReport && isViewingReportSubmissions) {
    return (
      <Layout>
        <div className={classes.root}>
          <ServiceAttendanceReport reportName={selectedReportName} reportId={selectedReport} reportFields={reportFields} onBackToList={handleBackToList} />
        </div>
      </Layout>
    );
  }

  if (selectedReport) {
    return (
      <Layout>
        <div className={classes.root}>
          <ReportDetail reportId={selectedReport} reportFields={reportFields} onBackToList={handleBackToList} />
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
              <Button variant="contained" color="primary" onClick={() => handleSubmitReport(report.id)}>
                Submit Report
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewSubmissions(report.id, report.name)}
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
