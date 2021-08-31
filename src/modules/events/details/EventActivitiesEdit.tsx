import Checkbox from "@material-ui/core/Checkbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import React, { useEffect, useState } from "react";
import { post } from "superagent";
import XAvatar from "../../../components/XAvatar";
import { remoteRoutes } from "../../../data/constants";
import { get, search } from "../../../utils/ajax";
import Toast from "../../../utils/Toast";
import EditDialog from "../../../components/EditDialog";
//import { IActivities, IEvent } from "../types";
import Loading from "../../../components/Loading";
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Grid from "@material-ui/core/Grid";
import { del } from "../../../utils/ajax";
import XForm from "../../../components/forms/XForm";
import { makeStyles, Theme, createStyles } from "@material-ui/core";
import { FormikHelpers } from "formik";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import XComboInput from "../../../components/inputs/XComboInput";
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
   data:any;
   done:(dt:any)=>any;
   onDeleted:(dt:any)=>any;
   onCancel?:()=>any;

}

// export interface IActivities {
//   id: number;
//   name: string;
//   eventId: number;
// }

function EventActivitiesEditor({data,done,onDeleted,onCancel }: IProps) {
  //const classes = useStyles();
  //const [data, setData] = React.useState<IActivities[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // const [editActivitiy, setEditingActivity] = React.useState<boolean>(false);
  // const [selected, setSelected] = React.useState<IActivities | null>(null);
function handleSubmit(values:any,actions:FormikHelpers<any>){
 const toSave:any ={
   ...values,
 }
 const submission:ISubmission = {
   url:remoteRoutes.eventsActivity,
   values:toSave,actions,isNew:false,
   onAjaxComplete:done
 }
 handleSubmission(submission)
}

function handleDelete(){
setLoading(true)
del(
  `${remoteRoutes.eventsActivity}/${data.id}`,
  dt=>{
    Toast.success("Operation succeeded")
    onDeleted(data)
  },
  undefined,
  ()=>{
    setLoading(false)
  })
}


  

  return (
    <XForm
    onSubmit={handleSubmit}
    initialValues={data}
    onDelete={handleDelete}
    loading={loading}
    onCancel={onCancel}
    >
      <Grid spacing={1}container>
        <Grid item xs ={12}>
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
