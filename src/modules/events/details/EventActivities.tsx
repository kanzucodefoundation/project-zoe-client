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
import { IActivities } from "../types";
import Loading from "../../../components/Loading";
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";


export interface IProps{
    eventId:number;
}



function EventActivities ({eventId}:IProps){

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
  
   
    return (
        <Box>
         <List> 
        {loading?(
            <Loading/>):(
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
                               checked ={Boolean(it.activities)}
                               inputProps={{"aria-labelledby":it.name}}
                               />  
                            </ListItemSecondaryAction>  

                            </ListItemText>
                            




                        </ListItem>
                    )


                });

        )}      
       
       </List>
       <Fab
       aria-label="Add new"
       className={classes.fab}
       color="primary"
       onClick={handleManualAdd}>
        <AddIcon></AddIcon> 
        </Fab> 

       </Box>
    )



};


export default EventActivities;




