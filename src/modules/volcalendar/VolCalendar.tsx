import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  Appointments,
} from '@devexpress/dx-react-scheduler-material-ui';
import Layout from "../../components/layout/Layout";





const currentDate = '2020-04-07';
const schedulerData = [
  { startDate: '2020-04-07T09:45', endDate: '2020-04-07T11:00', title: 'Cleaning the church' },
  { startDate: '2020-04-07T12:00', endDate: '2020-04-07T15:30', title: 'Setting up the cameras' },
  { startDate: '2020-04-08T03:45', endDate: '2020-04-08T06:00', title: 'Cleaning the church' },
  { startDate: '2020-04-09T12:00', endDate: '2020-04-09T13:30', title: 'Setting up the cameras' },
  { startDate: '2020-04-10T04:45', endDate: '2020-04-10T07:00', title: 'Cleaning the church' },
  { startDate: '2020-04-11T01:00', endDate: '2020-04-11T03:30', title: 'Setting up the cameras' },
];


export default function VolCalendar() {
    

    return (
        <Layout>
  <Paper>
    <Scheduler
      data={schedulerData}
    >
     
      <ViewState
        currentDate={currentDate}
      />
      <WeekView
        startDayHour={1}
        endDayHour={24}
      />
      <Appointments />
    </Scheduler>
  </Paper>
  </Layout>
)
}