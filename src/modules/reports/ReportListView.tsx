import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { ListItem, List, ListItemText } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
  localRoutes,
  remoteRoutes,
  appPermissions,
} from '../../data/constants';
import { get } from '../../utils/ajax';
import Layout from '../../components/layout/Layout';
import { IReport } from './types';
import Loading from '../../components/Loading';
import { IState } from '../../data/types';
import Toast from '../../utils/Toast';
import XBreadCrumbs from '../../components/XBreadCrumbs';
import { hasAnyRole } from '../../data/appRoles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';

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
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buttonContainer: {
      marginLeft: theme.spacing(2),
    },
  }),
);

const ReportListView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<IReport[]>([]);
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
        (error: any) => {
          Toast.error('Failed to fetch reports');
          console.error('Failed to fetch reports', error);
        },
        () => setLoading(false),
      );
    };

    fetchReports();
  }, []);

  const handleViewSubmissions = async (report: IReport) => {
    history.push(`${localRoutes.reports}/${report.id}/submissions`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout title="Report View List">
      <Box className={classes.root}>
        <Box pb={2}>
          <XBreadCrumbs
            title="Reports"
            paths={[
              {
                path: localRoutes.home,
                label: 'Dashboard',
              },
            ]}
          />
        </Box>
        <Box mt={2} className={classes.reportList}>
          <Table aria-label="simple table" size="small">
            <TableHead>
              <TableRow>
                <TableCell align="justify" component="th">
                  Report
                </TableCell>
                <TableCell align="center" component="th">
                  Report Type
                </TableCell>
                <TableCell align="center" component="th"></TableCell>
              </TableRow>
            </TableHead>
            {reports.map((report) => (
              <>
                {hasAnyRole(user, [
                  appPermissions.roleReportViewSubmissions,
                ]) && (
                  <TableBody>
                    <TableRow
                      key={report.id}
                      onClick={() => handleViewSubmissions(report)}
                      hover
                    >
                      <TableCell align="justify">{report.name}</TableCell>
                      <TableCell align="center">
                        {report.viewType?.toLocaleUpperCase()}
                      </TableCell>
                      <TableCell>&nbsp;&nbsp;</TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </>
            ))}
          </Table>
        </Box>
      </Box>
    </Layout>
  );
};

export default ReportListView;
