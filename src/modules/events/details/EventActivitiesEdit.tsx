import Checkbox from "@material-ui/core/Checkbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import React, { useEffect } from 'react';
import { post } from 'superagent';
import XAvatar from "../../../components/XAvatar";
import { remoteRoutes } from '../../../data/constants';
import { get,search } from '../../../utils/ajax';
import Toast from '../../../utils/Toast';
import EditDialog from "../../../components/EditDialog";
//import { IActivities, IEvent } from "../types";
import Loading from "../../../components/Loading";
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles, Theme, createStyles } from "@material-ui/core";


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

export interface IProps{
    eventId:number;
}

export interface IActivities{
id:number;
name:string;
eventId:number;
}
 
function EventActivities ({eventId}:IProps){
   const classes = useStyles();
   const [data,setData]= React.useState<IActivities[]>([]);
   const[loading,setLoading] = React.useState<boolean>(true);
   const [editActivitiy,setEditingActivity]= React.useState<boolean>(false);
   const[selected,setSelected] = React.useState<IActivities | null> (null);
    
   useEffect(()=>{
        setLoading(true);
        get(
          `${remoteRoutes.eventsActivity}/?eventId=${eventId}`,
            (data)=>{
            setData(data);
            },
            undefined,
         ()=>{
            setLoading(false);
            }

        );
    },[eventId]);
    const handleSelected = (it: IActivities) => () => {
    setSelected(it);
      };

       const handleEdited = (it: IActivities) => {
    setSelected(null);

    const newData = data.map((it: any) => {
      if (it.id === it.id) return it;
      else return it;
    });
    setData(newData);
  };

    function handleCloseDialog() {
    setEditingActivity(false);
    }

       return (
        <Box>
         <List dense className={classes.root}> 
        {loading?(
             <Loading/>

        )  :   (
          
                data.map((it)=>{
                    return (
                        <ListItem key ={it.id} button onClick={handleSelected(it)}>
                            <ListItemAvatar>
                                <XAvatar value = {it.name}/>
                            </ListItemAvatar>
                            <ListItemText
                             //id={it.id}
                             primary={it.name}
                            >
                             
                            </ListItemText>
                        </ListItem>
                    );
                })

             )}      
       
       </List>
       <EditDialog
         open={selected}
         onClose={()=>setSelected(null)}
         title="Edit Activity"         
        >
       <EditActivity
       data={selected}
       onDeleted={handleActivityDeleted}
       done={handleActivityEdited}
       />
       </EditDialog>
      

       </Box>
    )



};
export default EventActivities;




