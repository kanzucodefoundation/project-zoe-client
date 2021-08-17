import React, { useEffect, useState } from "react";
import TUICalendar from "@toast-ui/react-calendar";
import { ISchedule, ICalendarInfo } from "tui-calendar";
import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";
import { get } from "../../../utils/ajax";
import Layout from "../../../components/layout/Layout"
import { remoteRoutes } from "../../../data/constants";

const start = new Date();
const end = new Date(new Date().setMinutes(start.getMinutes() + 30));
const schedules: ISchedule[] = [
  {
    calendarId: "1",
    category: "time",
    isVisible: true,
    title: "",
    id: "1",
    body: "",
    location: "",
    start,
    end
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
  
];

interface IEvent {
    id: number;
    eventName: string;
    startDate: Date; 
    endDate: Date;
    venue: string;
  }

const MembersCalendar = (props: any) => {
    const [event, setEvent] = useState<any[]>([]);
  
    useEffect(() => {
        get (`${remoteRoutes.events}`,
        (data) => {let mcEvent: IEvent[] = []; {
          const groupEvent = {
            id: data.id,
            eventName: data.name, 
            startDate: data.startDate,
            endDate: data.endDate,
            venue:data.venue.name,
          };
          mcEvent.push(groupEvent);
        }
            setEvent(mcEvent);
    })
},
[]);

    return (
    <Layout>
        <h1>Worship Harvest Calendar</h1>
        {event.map((events:ISchedule, index) => (
            <TUICalendar
                key = {index}
                useCreationPopup={true}
                useDetailPopup={true}
                height="1000px"
                view="month"
                calendars={calendars}
                schedules={schedules}
                title = {events.title}
                //body = {events.body}
                //location = {events.location}
                //start = {events.start}
                //end = {events.end}
                />
        ))}
        </Layout>
    );
}
  
export default MembersCalendar;