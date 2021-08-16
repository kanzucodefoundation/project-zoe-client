import React, { useEffect } from "react";
import { remoteRoutes } from "../../../data/constants";



export interface IProps{
eventId:number;


}

export interface IActivities {
        id: number;
        name:string
        eventId: number;
        
        
      }


export default function EventActivities({eventId}:IProps){
        useEffect(() => {
                
                search(remoteRoutes.eventsAttendance, { eventId}, (resp) => { },
               
                );
              
       
        }

        return ();



};
