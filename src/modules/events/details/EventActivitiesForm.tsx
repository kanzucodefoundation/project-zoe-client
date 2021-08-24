import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { Formik } from "formik/dist/Formik";
import { FormikHelpers } from "formik/dist/types";
import React, { useState } from "react";

import XForm from "../../../components/forms/XForm";
import XTextInput from "../../../components/inputs/XTextInput";
import { IActivities } from "../types";
import Layout from "../../../components/layout/Layout";
import { remoteRoutes } from "../../../data/constants";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import FormFields from "../../../components/forms/FormFields";
import Toast from "../../../utils/Toast";
import { IEvent } from "../types";
import { del } from "../../../utils/ajax";

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
  data?: Partial<IEvent>;
  eventId:string;
  isNew: boolean;
  onCreated?: () => any;
  onUpdated?: () => any;
  onCancel?: () => any;
};

const EventActivitiesForm =({
  eventId,
  data,
  isNew,
  onCreated,

  onUpdated,
  onCancel,
}: IProps) =>{
  const [name, setData] = React.useState<IActivities[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);
  const initialValues = {
    name: "",
    event: "",
  };
  
  const classes = useStyles();
 
  const handleSubmit = (values: any, actions: FormikHelpers<any>) => {
    const toSave = {
      event: values.event,
      name: values.name,
      eventId: { eventId },
    };
    console.log(toSave);
    actions.resetForm();
    const submission: ISubmission = {
      url: remoteRoutes.eventsActivity,
      values: toSave,
      actions,
      isNew,
      onAjaxComplete: (data:any) => {
        if (isNew) {
          console.log(data);
          //onCreated && onCreated(data);
        } else {
          //onUpdated && onUpdated(data);
          console.log(data);
        }
        actions.resetForm();
        actions.setSubmitting(false);
        // handleClose();

      },
    };
    handleSubmission(submission);
  };
  
  // const handleDelete = () => {
  //   setLoading(true);
  //   // del(

  //   //   `${remoteRoutes.eventsActivity}/${data?.id}`,

  //   //   () => {
  //   //     Toast.success("Delete successfull");
  //   //     onDeleted && onDeleted(data?.id);
  //   //   },
  //   //   undefined,
  //   //   () => {
  //   //     setLoading(false);
  //   //   }
  //  // );
  // };

  
  function handleEdit() {
    setDialog(true);
  }


  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={name}
     
      onCancel={onCancel}
    >
      {
        <Grid spacing={1} container>
          <Grid item xs={12}>
            <XTextInput
              name="name"
              label="Activities"
              type="text"
              variant="outlined"
            />
          </Grid>
        </Grid>
      }
    </XForm>
  );
}

export default EventActivitiesForm;

