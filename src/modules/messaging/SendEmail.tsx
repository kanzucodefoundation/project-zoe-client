import React, { useState } from 'react';
import { remoteRoutes } from '../../data/constants';
import { post } from '../../utils/ajax';
import Toast from '../../utils/Toast';
import { FormikHelpers } from 'formik';
import { Box, Button, Grid } from '@material-ui/core';
import XForm from '../../components/forms/XForm';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { comboParser } from '../../components/inputs/inputHelpers';
import XTextInput from '../../components/inputs/XTextInput';
import XTextAreaInput from '../../components/inputs/XTextAreaInput';
import EditDialog from '../../components/EditDialog';
import SendIcon from '@material-ui/icons/Mail';

// TODO Remove code
const initials = {
  body: '',
  subject: '',
  recipientId: [],
};
const SendEmail = () => {
  // TODO remove this also
  const [emailDialog, setemailDialog] = useState<boolean>(false);
  const handleSendEmail = () => {
    setemailDialog(true);
  };

  // TODO close for the new method
  const closeEmailDialog = () => {
    setemailDialog(false);
  };

  // TODO remove this code after refactor
  const sendMail = (values: any, actions: FormikHelpers<any>) => {
    const toSave = {
      recipientId: values.recipientId.map((it: any) => it.id),
      body: values.body,
      subject: values.subject,
    };
    // const personIds = values.recipientId.map((it: any) => it.id);

    post(remoteRoutes.chat, toSave, () => {
      Toast.success('Email successfully sent');
      closeEmailDialog();
      actions.resetForm();
    });
  };
  return (
    <>
      <Box display="flex">
        <Box pr={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SendIcon />}
            onClick={handleSendEmail}
          >
            Send Email &nbsp;&nbsp;
          </Button>
        </Box>
      </Box>
      <EditDialog
        open={emailDialog}
        onClose={closeEmailDialog}
        title="Send Email to Members"
      >
        <XForm onSubmit={sendMail} initialValues={initials}>
          <div style={{ padding: 8 }}>
            <Grid spacing={2} container className="min-width-100">
              <Grid item xs={12}>
                <XRemoteSelect
                  name="recipientId"
                  label="Person"
                  remote={remoteRoutes.contactsPeopleCombo}
                  parser={comboParser}
                  variant="outlined"
                  multiple
                />
              </Grid>
              <Grid item xs={12}>
                <XTextInput
                  name="subject"
                  label="Subject"
                  type="text"
                  value="Hello"
                  variant="outlined"
                  autoComplete="off"
                />
              </Grid>
              <Grid item xs={12}>
                <XTextAreaInput
                  name="body"
                  label="Body"
                  type="text"
                  value="Hello"
                  variant="outlined"
                  autoComplete="off"
                />
              </Grid>
            </Grid>
          </div>
        </XForm>
      </EditDialog>
    </>
  );
};

export default SendEmail;
