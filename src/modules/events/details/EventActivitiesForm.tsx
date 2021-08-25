import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { Formik } from "formik/dist/Formik";
import { FormikHelpers } from "formik/dist/types";
import React, { useState,useEffect } from "react";
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
import { get } from "../../../utils/ajax";

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     root: {
//       width: "100%",
//       maxWidth: 360,
//       backgroundColor: theme.palette.background.paper,
//     },
//     fab: {
//       position: "absolute",
//       bottom: theme.spacing(2),
//       right: theme.spacing(2),
//     },
//   })
// );

interface IProps {
  data?: Partial<IEvent>;
  eventId:string;
  isNew: boolean;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  onDeleted?: (g: any) => any;
  onCancel: () => any;
};
const initialValues = {
  name: "",
  event: "",
};

const EventActivitiesForm =({
  data,
  isNew,
  eventId,
  onCreated,
  onDeleted,
  onUpdated,
  onCancel,
}: IProps) =>{
  //const [name, setData] = React.useState<IActivities[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
 
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
          onCreated && onCreated(data);
        } else {
          onUpdated && onUpdated(data);
          console.log(data);
        }
        actions.resetForm();
        actions.setSubmitting(false);
      

      },
    };
    handleSubmission(submission);
  };
  
  function handleDelete () {
    setLoading(true);
    del(

      `${remoteRoutes.eventsActivity}/${data?.id}`,

      () => {
        Toast.success("Delete successfull");
        onDeleted && onDeleted(data?.id);
      },
      undefined,
      () => {
        setLoading(false);
      }
   );
  };

  
  // function handleEdit() {
  //   setDialog(true);
  // }


  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={{data}}
      onDelete={handleDelete}
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

