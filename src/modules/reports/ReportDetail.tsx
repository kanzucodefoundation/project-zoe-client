import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Loading from '../../components/Loading';
import ReportForm from './ReportFormSubmit';
import { IReport, IReportColumn } from './types';

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
  reportFields: IReportColumn[];
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
        <button onClick={onBackToList}>Back to Report List</button>
      </Box>
      <Box mt={2}>
        {reportFields.length > 0 ? (
          <ReportForm reportId={report.id.toString()} fields={reportFields} />
        ) : (
          <Loading />
        )}
      </Box>
    </>
  );
};

export default ReportDetail;
