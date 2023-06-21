import React, { useEffect, useState } from 'react';
import ReportForm from './ReportFormSubmit';
import { remoteRoutes } from '../../data/constants';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Loading from '../../components/Loading';
import {get} from "../../utils/ajax";
import { IReportColumn } from './types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    title: {
      marginBottom: theme.spacing(2),
    },
  })
);

const ReportPage: React.FC = () => {
  const [fields, setFields] = useState<IReportColumn[]>([]);
  const [showDialog, setShowDialog] = useState(true);
  const classes = useStyles();

  
  useEffect(() => {
    const fetchReport = async () => {
      get(
        `${remoteRoutes.reports}/6`,
        (response: any) => {
          if (response.fields.length) {
            const fields = response.fields;
            setFields(fields);
          } else {
            console.error('Failed to fetch report');
          }
        },
        undefined,
        () => setShowDialog(false)
      );
    };
  
    fetchReport();
  }, []); // Add an empty dependency array here
  
  

    return (
        <div className={classes.root}>
          <Typography variant="h4" className={classes.title}>
            Report Submission
          </Typography>
          {fields.length > 0 ? (
            <ReportForm reportId="6" fields={fields} />
          ) : (
            <Loading />
          )}
        </div>
      );
}
export default ReportPage;
