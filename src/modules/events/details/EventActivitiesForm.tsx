import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { Formik } from "formik/dist/Formik";
import { FormikHelpers } from "formik/dist/types";
import React, { useState,useEffect } from "react";
import XForm from "../../../components/forms/XForm";
import EditDialog from "../../../components/EditDialog";
import XTextInput from "../../../components/inputs/XTextInput";
import { IActivities } from "../types";
import { Box, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Layout from "../../../components/layout/Layout";
import { remoteRoutes } from "../../../data/constants";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import FormFields from "../../../components/forms/FormFields";
import Toast from "../../../utils/Toast";
import { IEvent } from "../types";
import { post } from "../../../utils/ajax";
import { get } from "../../../utils/ajax";



interface IProps {
   eventId:string;
  
};

const initialValues = {
  name: "", 
};
//EventActivities component to submit activities.
const EventActivitiesForm =( 
  props: IProps) =>{  
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogAdd, setDialogAdd] = useState<boolean>(false);
   
    const handleClose = () => {
     setDialogAdd(false);

    };
    function handleAdd() {
    setDialogAdd(true);
  }
 //Handle submit function with to const to save form data api call to post data.
  const handleSubmit = (values: any, actions: FormikHelpers<any>) => {   
  const toSave: any = {      
      name: values.name,
      eventId:props.eventId ,
    };
    //console.log(toSave);
    actions.resetForm();    
    post(remoteRoutes.eventsActivity,toSave,()=>{
        Toast.success("Added activity successfully")
        handleClose();
        actions.resetForm();
    });

  };
  return (
    <>
          <Box display = "flex">  <Box pr={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  
                >
                  Add Activities&nbsp;&nbsp;
                </Button>
              </Box>  </Box>
        <EditDialog
          open={dialogAdd}
          onClose={handleClose}
          title="Add Activity"
      >      
    <XForm
      onSubmit={handleSubmit}
      initialValues={initialValues}       
    >
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
}

export default EventActivitiesForm;

