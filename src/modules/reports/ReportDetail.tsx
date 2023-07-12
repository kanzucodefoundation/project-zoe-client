import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Loading from '../../components/Loading';
import ReportSubmissionForm from './ReportSubmissionForm';
import { IReport, IReportColumn, IReportField } from './types';

const useStyles = makeStyles((theme: Theme) => createStyles({
  title: {
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    marginLeft: theme.spacing(2),
  },
}));

interface ReportDetailProps {
  report: IReport;
  reportFields: IReportField[];
  onBackToList: () => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({
  report,
  reportFields,
  onBackToList,
}) => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="button" className={classes.title}>
        Report Submission
      </Typography>
      <Box mt={2}>
        <Typography variant="subtitle1">Report Name: {report.name}</Typography>
      </Box>
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={onBackToList}>
          Back to Report List
        </Button>
      </Box>
      <Box mt={2}>
        {reportFields.length > 0 ? (
          <ReportSubmissionForm reportId={report.id.toString()} fields={reportFields} onSubmit={onBackToList} />
        ) : (
          <Loading />
        )}
      </Box>
    </>
  );
};

export default ReportDetail;
