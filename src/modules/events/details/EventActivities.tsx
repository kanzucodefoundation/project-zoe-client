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
import { get } from '../../../utils/ajax';
import Toast from '../../../utils/Toast';
import { IActivities, IEvent } from "../types";
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
    eventId:string;
}

export interface IActivities{
id:number;
name:string;
eventId:number;

}

export const processData=(
    activities:IActivities[],
    event:IEvent[],
    eventId:number
)=>{
    const finalData:IActivities[] =[...activities];
    const actIds =activities.map((it)=>`${it.eventId}`);
    event.forEach(({eventId})=>{
        if(!actIds.includes(`${eventId}`)){
            finalData.push({
               id:"0",
               name,
               eventId,
            });

        }

    });
    return finalData;


};

function EventActivities ({eventId}:IProps){
   const classes = useStyles();
   const [data,setData]= React.useState<IActivities[]>([]);
   const[loading,setLoading] = React.useState<boolean>(true);
    
   useEffect(()=>{
        setLoading(true);
        get(`${remoteRoutes.eventsActivity}`,
        (data)=>{
        setData(data);
        },
            undefined,()=>{
                setLoading(false);
            }

        );


    },[eventId]);

  const handleToggle = (eventId:number)=>()=>{
    const [activities]:IActivities[]=data.filter(
        (it)=> it.eventId=== eventId
    );
    let toUpdate={...activities};
    post(
        remoteRoutes.eventsActivity,
        toUpdate,(resp)=>{
          const newList:IActivities[]=data.map((it)=>{
              if(it.eventId === eventId){
                  return {...it,...resp};
                
              }
              return it;
          });
          setData(newList);
        },
       ()=>{
           Toast.error("Update failed");
       }
    );


  };
  const handleManualAdd=()=>{};
  data.sort((a,b) => {
 var nameA=a.name.name;
 var nameB=b.name.name;
 if(nameA<nameB){
     return -1;
    }
    return 0; 
  });
   
    return (
        <Box>
         <List dense className={classes.root}> 
        {loading?(
            <Loading/>
        )  :   (
                data.map((it)=>{
                    return (
                        <ListItem key ={it.eventId} button>
                            <ListItemAvatar>
                                <XAvatar value = {it.name}/>

                            </ListItemAvatar>
                            <ListItemText
                             id={it.id}
                             primary={it.name}

                            >
                             <ListItemSecondaryAction>
                               <Checkbox
                               edge="end"
                               onChange={handleToggle(it.eventId)}
                               checked ={Boolean(it.name)}
                               inputProps={{"aria-labelledby":it.name}}
                               />  
                            </ListItemSecondaryAction>  

                            </ListItemText>
                            




                        </ListItem>
                    );
                })

        )}      
       
       </List>
       <Fab
       aria-label="Add new"
       className={classes.fab}
       color="primary"
       onClick={handleManualAdd}>
        <AddIcon/>
        </Fab> 

       </Box>
    )



};


export default EventActivities;




