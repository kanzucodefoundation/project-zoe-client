import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import React, { useCallback,useEffect } from "react";
import EditDialog from "../../../components/EditDialog";
import EventActivitiesEditor from "./EventActivitiesEdit";
//import { IActivities, IEvent } from "../types";
import Loading from "../../../components/Loading";
import XAvatar from "../../../components/XAvatar";
import { remoteRoutes } from "../../../data/constants";
import { get, search } from "../../../utils/ajax";
//import { useCallback } from "react";

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

export interface IProps {
  eventId: number;
}

export interface IActivities {
  id: number;
  name: string;
  eventId: number;
}

function EventActivities({ eventId }: IProps) {
  const classes = useStyles();
  const [data, setData] = React.useState<IActivities[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [editActivitiy, setEditingActivity] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<IActivities | null>(null);

    const fetchActivities = useCallback(()=>{
      setLoading(true);
      console.log("fetchActivities",eventId);
     search(
      remoteRoutes.eventsActivity,
      {
        eventId:eventId,
      },
      (data)=>{
        setData(data);
      },
      undefined,
      ()=>{
        setLoading(false);
      }
  );
},[eventId]);

  useEffect(()=>{
    fetchActivities();

  },[fetchActivities]);
 
 
  

  const handleSelected = (it: IActivities) => () => {
    setSelected(it);
  };

  const handleActivityEdited = (it: IActivities) => {
    setSelected(null);

    const newData = data.map((it: any) => {
      if (it.id === it.id) return it;
      else return it;
    });
    setData(newData);
  };
//
   const handleActivityDeleted=(it:IActivities)=>{
    setSelected(null);
    const newData= data.filter((it:any)=>it.id !== it.id);
    setData(newData);

   }
   //
   function handleDone(){
    fetchActivities();
    setEditingActivity(false);
   }
  function handleCloseDialog() {
    setEditingActivity(false);
  }

  return (
    <Box>
      <List dense className={classes.root}>
        {loading ? (
          <Loading />
        ) : (
          data.map((it) => {
            return (
              <ListItem key={it.id} button onClick={handleSelected(it)}>
                <ListItemAvatar>
                  <XAvatar value={it.name} />
                </ListItemAvatar>
                <ListItemText
                  //id={it.id}
                  primary={it.name}
                ></ListItemText>
              </ListItem>
            );
          })
        )}
      </List>   
      <EditDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Edit Activity ${selected?.name}`}
       
      >
        <EventActivitiesEditor
          data={selected}
          onDeleted={handleActivityDeleted}
          done={handleActivityEdited}        
        
        />
      </EditDialog>  
    </Box>
  );
}
export default EventActivities;
