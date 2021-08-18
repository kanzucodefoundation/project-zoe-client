import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import React from "react";
import XForm from "../../../components/forms/XForm";
import { XRemoteSelect } from "../../../components/inputs/XRemoteSelect";
import Layout from "../../../components/layout/Layout";
import { remoteRoutes } from "../../../data/constants";



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

export interface IProps{
eventId:string;

}

export interface IActivities{
id:number;
name:string;
eventId:string;


}

export const processData = (activities:IActivities[],eventId:string)=> {
    const finalData:IActivities[]=[...activities];
    const actId =activities.map((it)=> `${it.eventId}`);


    return finalData;




}
function EventActivitiesForm ({eventId}:IProps) {
 const classes = useStyles();
 const [data,setData]= React.useState<IActivities[]>([]);

  return (
    <XForm
    onSubmit={handleSubmit}
    schema={schema}
    initialValues={}
    onDelete={handleDelete}
    loading={laoding}
    onCancel={onCancel}
    >
        {(
        <Grid>
            <
            remote={remoteRoutes}
            name="activities"
            label="Activities"
            variant="outlined"
            onSelect=

            />
        </Grid>

        )}

    </XForm>



    






}

export default EventActivitiesForm;
