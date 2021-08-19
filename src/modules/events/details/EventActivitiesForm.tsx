import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { Formik } from "formik/dist/Formik";
import { FormikHelpers } from "formik/dist/types";
import React from "react";
import XForm from "../../../components/forms/XForm";
import XTextInput from "../../../components/inputs/XTextInput";
import { IActivities } from "../types";
import Layout from "../../../components/layout/Layout";
import { remoteRoutes } from "../../../data/constants";
//import Loading from "../../../components/Loading";
import FormFields from "../../../components/forms/FormFields";
import { XRemoteSelect } from "../../../components/inputs/XRemoteSelect";
// import handleSubmit from "../../../components/forms/XForm";
// // import handleDelete from "../../../components/forms/XForm";

const initialValues = {
  activities: "",
  event: ""
};

const useStyles =makeStyles((theme:Theme)=>
createStyles({
root:{
 width:"100%",
 maxWidth:360,
 backgroundColor: theme.palette.background.paper,
},
fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },

})
);


export interface IProps {
eventId:string;

}


// export const  processData = (activities:IActivities[],eventId:string) => {
//     const finalData:IActivities[]=[...activities];
//     const actIds =activities.map((it)=> `${it.eventId}`);
//       activities.forEach((eventId)=>{
//         if (!actIds.includes(`${eventId}`)){
//      finalData.push({
//       activities,
      
//       id:"0",
//       })

//         }

      
//       })
//     return finalData;
// }

 
function EventActivitiesForm ({eventId}:IProps) {
// console.log({eventId});
const handleSubmit = (values: any, actions: FormikHelpers<any>) => {
    const toSave = {
      event:values.event,
      activities:values.activities,
      eventId: {eventId},
      

    };
    console.log(toSave);

    // post(remoteRoutes.eventActivities, toSave, () => {
    //   Toast.success("Activity added");
    //   handleClose();
    //   actions.resetForm();
    // });
  };



 const classes = useStyles();
 const [activities,setData]= React.useState<IActivities[]>([]);

 
 return (
 
        <XForm
        onSubmit={handleSubmit}       
        initialValues={activities}
        // onDelete={handleDelete}
        // loading={loading}
        // onCancel={onCancel}
        >
        {(
              <Grid spacing={1} container>
         
          <Grid item xs={12}>
          <XRemoteSelect
            remote={remoteRoutes.events}
            name="event"
            label="Events"           
            variant="outlined"
          />
        </Grid>

               <Grid item xs={12}>
               <XTextInput
                 name="activities"
                 label="Activities"
                 type="text"
                 variant="outlined"
               />
            </Grid>

            

        </Grid>
        )} 
       
        </XForm>

 )
}

export default EventActivitiesForm;
