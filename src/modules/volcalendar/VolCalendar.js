// import * as React from 'react';
// import Paper from '@material-ui/core/Paper';
// import {
//   Scheduler,
//   WeekView,
//   Appointments,
// } from '@devexpress/dx-react-scheduler-material-ui';


// import appointments from '../../data/volcalendar/today-appointments';
// import Layout from "../../components/layout/Layout";


// export default class VolCalendar extends React.PureComponent {
//   constructor(props) {
//     super(props);
//     this.state = {
//       data: appointments,
//     };
//   }

//   render() {
//     const { data } = this.state;

//     return (
//         <Layout>
//       <Paper>
//         <Scheduler
//           data={data}
//           height={660}
//         >
//           <WeekView
//             startDayHour={9}
//             endDayHour={19}
//           />
//           <Appointments />
//         </Scheduler>
//       </Paper>
//       </Layout>
//     );
//   }
// }
