import { Grid, Box, Button } from '@material-ui/core';
import { FormikHelpers } from 'formik/dist/types';
import React, { useState } from 'react';
import AddIcon from '@material-ui/icons/Add';
import XForm from '../../../components/forms/XForm';
import EditDialog from '../../../components/EditDialog';
import XTextInput from '../../../components/inputs/XTextInput';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';
import { post } from '../../../utils/ajax';

interface IProps {
  eventId: string;
}

const initialValues = {
  name: '',
};
// EventActivities component to submit activities.
const EventActivitiesForm = (props: IProps) => {
  function toLowerCase(s: string) {
    return s[0].toUpperCase() + s.slice(1);
  }
  function removeStringSpaces(s: string) {
    return s.replace(/\s+/g, '');
  }
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogAdd, setDialogAdd] = useState<boolean>(false);

  const handleClose = () => {
    setDialogAdd(false);
  };
  function handleAdd() {
    setDialogAdd(true);
  }
  // Handle submit function with to const to save form data api call to post data.
  const handleSubmit = (values: any, actions: FormikHelpers<any>) => {
    const removeAllSpaces = removeStringSpaces(values.name);
    const name = toLowerCase(removeAllSpaces);
    const toSave: any = {
      name: values.name,
      eventId: props.eventId,
    };

    actions.resetForm();
    post(remoteRoutes.eventsActivity, toSave, () => {
      Toast.success('Added activity successfully');
      handleClose();
      actions.resetForm();
      window.location.reload();
    });
  };
  return (
    <>
      <Box display="flex">
        {' '}
        <Box pr={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Activities&nbsp;&nbsp;
          </Button>
        </Box>{' '}
      </Box>
      <EditDialog open={dialogAdd} onClose={handleClose} title="Add Activity">
        <XForm onSubmit={handleSubmit} initialValues={initialValues}>
          {
            <Grid spacing={1} container>
              <Grid item xs={12}>
                <XTextInput
                  name="name"
                  label="Activity"
                  type="text"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          }
        </XForm>
      </EditDialog>
    </>
  );
};

export default EventActivitiesForm;
