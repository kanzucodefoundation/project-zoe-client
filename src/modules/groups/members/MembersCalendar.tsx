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
    groupName: string;
    startDate: Date; 
    endDate: Date;
    venue: string;
  }

const MembersCalendar = (props: any) => {
    const [event, setEvent] = useState<any[]>([]);
  
    useEffect(() => {
        get (`${remoteRoutes.events}`,
        (event) => {let mcevent: IEvent[] = [];
            
            setEvent(event);
    })
},
[]);

    return (
    <Layout>
        <h1>Worship Harvest Calendar</h1>
        {event.map((event:ISchedule, index) => (
            <TUICalendar
                height="1000px"
                view="month"
                useCreationPopup={true}
                useDetailPopup={true}
                calendars={calendars}
                schedules={schedules}
                />
        ))}
        </Layout>
    );
}
  
  export default MembersCalendar;