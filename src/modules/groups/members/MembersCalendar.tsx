import React, { useEffect, useState } from "react";
import TUICalendar from "@toast-ui/react-calendar";
import { ISchedule, ICalendarInfo } from "tui-calendar";
import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";
import { get } from "../../../utils/ajax";
import Layout from "../../../components/layout/Layout";
import { remoteRoutes } from "../../../data/constants";
import { signInToGoogle, initClient,getSignedInUserEmail, signOutFromGoogle , publishTheCalenderEvent } from "./GoogleCalSync"

import { Button } from '@material-ui/core';

const start = new Date();
const end = new Date(new Date().setMinutes(start.getMinutes() + 30));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const schedules: ISchedule[] = [
  {
    calendarId: "1",
    category: "time",
    isVisible: true,
    title: "Meeting",
    id: "1",
    body: "Description",
    location: "Kampala",
    start,
    end
  },

  {
    calendarId: "2",
    category: "time",
    isVisible: true,
    title: "Community",
    id: "2",
    body: "Description",
    location: "Lugogo",
    start: new Date(new Date().setHours(start.getHours() + 1)),
    end: new Date(new Date().setHours(start.getHours() + 2))
  }
];

const calendars: ICalendarInfo[] = [
  {
    id: "1",
    name: "My Calendar",
    color: "#ffffff",
    bgColor: "#9e5fff",
    dragBgColor: "#9e5fff",
    borderColor: "#9e5fff"
  },

  {
    id: "2",
    name: "MC Calendar",
    color: "#ffffff",
    bgColor: "#00a9ff",
    dragBgColor: "#00a9ff",
    borderColor: "#00a9ff"
  }
  
];

const month={
  startDayOfWeek: 0,
  daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}

const MembersCalendar = () => {
    const [event, setEvent] = useState<any>([]);
  
      useEffect(() => {
        get (`${remoteRoutes.events}`,
        (data) => { let events: ISchedule[] = [];
          console.log(events);
          for (let i = 0; i < data.length; i++) {
            const mce = {
              //calendarId: data[i].id,
              category: "time",
              isVisible: true,
              id: data[i].id,
              title: data[i].name,
              body: data[i].summary,
              location: data[i].venue.name,
              start:data[i].startDate,
              end:data[i].endDate,
            };
  
            events.push(mce);
          }
          setEvent(events);
          },)
},
[]);

const [signedin,setSignedIn] = useState(false);
const [googleAuthedEmail,setgoogleAuthedEmail] = useState <any | null> (null);

useEffect(()=>{
  initClient((success: any)=>{
      if (success){
          getGoogleAuthorizedEmail();
          } 
  });
},[]);

const getGoogleAuthorizedEmail =async ()=>{
  let email = await getSignedInUserEmail();
  if (email){
      setSignedIn(true)
      setgoogleAuthedEmail(email);
      
  }
};
const getAuthToGoogle =async ()=>{
  let successfull =await signInToGoogle();
  if (successfull){
      getGoogleAuthorizedEmail();
  }
};

/*const _signOutFromGoogle = () => {
  let status = signOutFromGoogle();
  if (status){
      setSignedIn(false);
      //setgoogleAuthedEmail(null);
  }
};*/

const handleClick = (calEvent: any | "") => { 
  getAuthToGoogle()
  .then(() => {
    var googleCalEvent = {}; 
    if (calEvent !== "" ) {
          googleCalEvent = {
            'summary': calEvent.title,
            'location': calEvent.location,
            'description': calEvent.body,
            'start':{dateTime:calEvent.start},
            'end': {dateTime:calEvent.end}
      }; 
      publishTheCalenderEvent(googleCalEvent);
      console.log(googleCalEvent);
  }
})
}
  
    return (
      <Layout>
        <h1>Worship Harvest Calendar</h1>
        <Button
              onClick={()=>handleClick(event? event[5]:"")}
            >
              Add to Google Calendar
            </Button>

        <TUICalendar
        useCreationPopup={true}
        useDetailPopup={true}
        height="1000px"
        view="month"
        month = {month}
        calendars={calendars}
        schedules={event}
        />
        </Layout>
    );
}
  
export default MembersCalendar; 