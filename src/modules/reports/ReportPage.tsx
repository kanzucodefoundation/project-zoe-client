import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { remoteRoutes } from '../../data/constants';
import { get } from '../../utils/ajax';
import Loading from '../../components/Loading';
import ReportForm from './ReportFormSubmit';
import Layout from '../../components/layout/Layout';
import { IReportColumn } from './types';

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
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
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

  const handleReportClick = async (reportId: number) => {
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

  const handleBackToList = () => {
    setSelectedReport(null);
    setReportFields([]);
  };

  if (loading) {
    return <Loading />;
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
          {reports.map((report) => (
            <div
              key={report.id}
              className={classes.reportItem}
              onClick={() => handleReportClick(report.id)}
            >
              {report.name}
            </div>
          ))}
        </Box>
      </div>
    </Layout>
  );
};

export default ReportPage;
