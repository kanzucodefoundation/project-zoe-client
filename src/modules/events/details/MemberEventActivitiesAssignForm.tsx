import React, { useState } from 'react';
import { FormikHelpers } from 'formik';
import { Grid } from '@material-ui/core';
import { remoteRoutes } from '../../../data/constants';
import XForm from '../../../components/forms/XForm';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';
import { XRemoteSelect } from '../../../components/inputs/XRemoteSelect';
import { comboParser } from '../../../components/inputs/inputHelpers';

interface IProps {
  data?: any | null;
  isNew: boolean;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  onCancel?: (g: any) => any;
  done: any;
}
const initialValues = {
  activity: '',
  contact: '',
};

const MemberEventActivitiesForm = ({
  data,
  done,
  isNew,
  onCreated,
  onCancel,
  onUpdated,
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);

  const handleSubmit = (values: any, actions: FormikHelpers<any>) => {
    console.log(values);
    const toSave = {
      activityId: values.activity.id,
      contactId: values.contact.map((it: any) => it.id),
    };
    console.log(toSave);

    const submission: ISubmission = {
      url: remoteRoutes.memberEventActivities,
      values: toSave,
      actions,
      isNew,
      onAjaxComplete: (data: any) => {
        if (isNew) {
          onCreated && onCreated(data);
        } else {
          onUpdated && onUpdated(data);
          if (done) done();
          window.location.reload();
        }
        actions.resetForm();
        actions.setSubmitting(false);
      },
    };
    handleSubmission(submission);
    if (done) done();
  };

  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={initialValues || data}
      loading={loading}
      onCancel={done}
    >
      <Grid spacing={1} container>
        <Grid item xs={12}>
          <XRemoteSelect
            name="activity"
            label="Activity"
            remote={remoteRoutes.eventsActivity}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <XRemoteSelect
            name="contact"
            label="Members"
            remote={remoteRoutes.contactsPeopleCombo}
            parser={comboParser}
            variant="outlined"
            multiple
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default MemberEventActivitiesForm;
