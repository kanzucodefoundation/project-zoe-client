import React, { useEffect, useState } from "react";
import TUICalendar from "@toast-ui/react-calendar";
import { ISchedule, ICalendarInfo } from "tui-calendar";
import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";
import { get } from "../../../utils/ajax";
import Layout from "../../../components/layout/Layout"
import { remoteRoutes } from "../../../data/constants";
import { Alert } from "@material-ui/lab";

const start = new Date();
const end = new Date(new Date().setMinutes(start.getMinutes() + 30));
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

const MembersCalendar = () => {
    const [event, setEvent] = useState<any[]>([]);
  
    useEffect(() => {
        get (`${remoteRoutes.events}`,
        (data) => { let events: ISchedule[] = [];
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
          console.log(events);
          setEvent(events);
          //createSchedules(event);
          },)
},
[]);

    return (
      <Layout>
        <h1>Worship Harvest Calendar</h1>
        <TUICalendar
        useCreationPopup={true}
        useDetailPopup={true}
        height="1000px"
        view="month"
        calendars={calendars}
        schedules={event}
        //raw = {event}
        />
        </Layout>
    );
}
  
export default MembersCalendar;
