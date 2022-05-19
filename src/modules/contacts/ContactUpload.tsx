import React, { useCallback, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import { DropzoneArea } from 'material-ui-dropzone';
import { hasNoValue } from '../../components/inputs/inputHelpers';
import { remoteRoutes } from '../../data/constants';
import { downLoad, postFile, triggerDownLoad } from '../../utils/ajax';
import EditDialog from '../../components/EditDialog';
import { getRandomStr } from '../../utils/stringHelpers';
import Loading from '../../components/Loading';

const fileTypes = ['.csv'];

interface IProps {
  show: boolean;
  onClose: () => any;
  onDone: () => any;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  zone: {
    width: 400,
  },
}));

const ContactUpload = ({ show, onClose, onDone }: IProps) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [files, setFiles] = useState<any[] | null>(null);

  const onDrop = useCallback((files: any[]) => {
    if (hasNoValue(files)) {
      return;
    }
    setFiles(files);
    setLoading(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    postFile(
      remoteRoutes.contactsPeopleUpload,
      formData,
      (data) => {
        setSuccess(true);
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  }, []);

  function handleSampleDownload() {
    downLoad(remoteRoutes.contactsPeopleSample, (data) => {
      triggerDownLoad(data, `file-${getRandomStr(5)}.csv`);
    });
  }

  return (
    <EditDialog
      title="Upload data"
      open={show}
      onClose={onClose}
      disableBackdropClick
    >
      <Grid container spacing={1} style={{ width: 400 }}>
        {files && (
          <Grid item xs={12}>
            {loading ? (
              <Loading />
            ) : (
              <Box display="flex" justifyContent="center">
                {success ? (
                  <Alert severity="success">Upload complete</Alert>
                ) : (
                  <Alert severity="error">Upload failed</Alert>
                )}
              </Box>
            )}
          </Grid>
        )}
        {(hasNoValue(files) || !success) && (
          <Grid item xs={12}>
            <Box pb={2}>
              <DropzoneArea
                dropzoneClass={classes.zone}
                dropzoneText="Drop excel here or click"
                acceptedFiles={fileTypes}
                onChange={onDrop}
              />
            </Box>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box p={1} pt={2}>
            <Grid
              container
              spacing={1}
              alignContent="flex-end"
              justify="flex-end"
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  onClick={handleSampleDownload}
                  disabled={loading || success}
                >
                  Get Sample
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  onClick={onClose}
                  disabled={loading || success}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onDone}
                  disabled={!success}
                >
                  Done
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </EditDialog>
  );
};

export default ContactUpload;
