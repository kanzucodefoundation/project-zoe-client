import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { useParams } from 'react-router';
import { ReportSubmissionData } from './types';
import Loading from '../../components/Loading';
import { Grid } from '@material-ui/core';
import Layout from '../../components/layout/Layout';
import DetailView, { IRec } from '../../components/DetailView';
import DataCard from '../../components/DataCard';
import Toast from '../../utils/Toast';

const ReportSubmissionDetail = () => {
  const [submissionData, setSubmissionData] = useState<IRec[]>([]);
  const { reportId, reportSubmissionId } = useParams<any>();
  const [ isLoadingData, setIsLoadingData ] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      get(
          `${remoteRoutes.reports}/${reportId}/submissions/${reportSubmissionId}`,
          (resp: ReportSubmissionData) => {
            setIsLoadingData(false);
            const submissionDetails: IRec[] = [];
            if (!resp){
              setSubmissionData(submissionDetails);
              return
            }
            Object.entries(resp.data).forEach(([key, value]) => {
              const rec: IRec = {
                label: key,
                value: value
              };
              submissionDetails.push(rec);
            });
            submissionDetails.push(
              { label: "submittedAt", value: resp.submittedAt },
              { label: "submittedBy", value: resp.submittedBy }
            );
            setSubmissionData(submissionDetails);  
          },
          () => {setIsLoadingData(false); Toast.error('Error fetching submission data')}  
        );
    };

    fetchSubmissionData();
  }, []);

  if (isLoadingData) {
    return <Loading />;
  }

  return (
    <Layout>
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="button" component="div">
              Report Submission Details
            </Typography>
              {submissionData.length ? (
                <DataCard useActionContent={false} title="" buttons={''}>
                  <DetailView data={submissionData} />
                </DataCard>
              ) : (
                <Typography>No submission found</Typography>
              )}
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
  };

export default ReportSubmissionDetail;
