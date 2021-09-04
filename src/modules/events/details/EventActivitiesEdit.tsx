import React, { useState } from "react";
import { remoteRoutes } from "../../../data/constants";
import Toast from "../../../utils/Toast";
import Grid from "@material-ui/core/Grid";
import { del } from "../../../utils/ajax";
import XForm from "../../../components/forms/XForm";
import { makeStyles, Theme, createStyles } from "@material-ui/core";
import { FormikHelpers } from "formik";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import XTextInput from "../../../components/inputs/XTextInput";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

interface IProps {
  data: any;
  done: (dt: any) => any;
  onDeleted: (dt: any) => any;
  onUpdated?: (dt: any) => any;
  onCancel?: () => any;
}

function EventActivitiesEditor({ data, done, onDeleted, onCancel }: IProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [editActivitiy, setEditingActivity] = React.useState<boolean>(false);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      ...values,
    };
    const submission: ISubmission = {
      url: remoteRoutes.eventsActivity,
      values: toSave,
      actions,
      isNew: false,
      onAjaxComplete: done,
    };
    handleSubmission(submission);
  }

  function handleDelete() {
    setLoading(true);
    del(
      `${remoteRoutes.eventsActivity}/${data.id}`,
      (dt) => {
        Toast.success("Operation succeeded");
        onDeleted(data);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }

  function handleEdit() {
    setEditingActivity(true);
  }

  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={data}
      onDelete={handleDelete}
      loading={loading}
      onCancel={onCancel}
    >
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
    </XForm>
  );
}
export default EventActivitiesEditor;
