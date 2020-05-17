import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Resources,
  WeekView,
  MonthView,
  Appointments,
  AppointmentTooltip,
} from '@devexpress/dx-react-scheduler-material-ui';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import Layout from "../../components/layout/Layout";

const appointments = [{
  title: 'Choir Rehearsals',
  startDate: new Date(2018, 5, 25, 12, 35),
  endDate: new Date(2018, 5, 25, 15, 0),
  id: 0,
  members: [1, 3, 5],
  priority: 'Priority 1',
}, {
  title: 'Tapestry Arrangement',
  startDate: new Date(2018, 5, 26, 12, 35),
  endDate: new Date(2018, 5, 26, 15, 0),
  id: 1,
  members: [2, 4],
  priority: 'Priority 2',
}, {
  title: 'Church Cleaning',
  startDate: new Date(2018, 5, 27, 12, 35),
  endDate: new Date(2018, 5, 27, 15, 0),
  id: 2,
  members: [3],
  priority: 'Priority 3',
}, {
  title: 'Sunday School Planning',
  startDate: new Date(2018, 5, 28, 12, 35),
  endDate: new Date(2018, 5, 28, 15, 0),
  id: 3,
  members: [4, 1],
  priority: 'Priority 4',
}, {
  title: 'Final Budget Review',
  startDate: new Date(2018, 5, 29, 12, 35),
  endDate: new Date(2018, 5, 29, 15, 0),
  id: 4,
  members: [5, 1, 3],
  priority: 'Priority 5',
}];

const styles = theme => ({
  container: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    justifyContent: 'flex-end',
  },
  text: {
    ...theme.typography.h6,
    marginRight: theme.spacing(2),
  },
});

const ResourceSwitcher = withStyles(styles, { name: 'ResourceSwitcher' })(
  ({
    mainResourceName, onChange, classes, resources,
  }) => (
    <div className={classes.container}>
      <div className={classes.text}>
        Main resource name:
      </div>
      <Select
        value={mainResourceName}
        onChange={e => onChange(e.target.value)}
      >
        {resources.map(resource => (
          <MenuItem key={resource.fieldName} value={resource.fieldName}>
            {resource.title}
          </MenuItem>
        ))}
      </Select>
    </div>
  ),
);

export default class Volunteer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: appointments,
      mainResourceName: 'members',
      resources: [
        {
          fieldName: 'priority',
          title: 'Priority',
          instances: [
            { id: 'Priority 1', text: 'Priority 1' },
            { id: 'Priority 2', text: 'Priority 2' },
            { id: 'Priority 3', text: 'Priority 3' },
            { id: 'Priority 4', text: 'Priority 4' },
            { id: 'Priority 5', text: 'Priority 5' },
          ],
        },
        {
          fieldName: 'members',
          title: 'Members',
          allowMultiple: true,
          instances: [
            { id: 1, text: 'Ahmed Shayo' },
            { id: 2, text: 'Maria-Angella' },
            { id: 3, text: 'Mary Ibia Goretti' },
            { id: 4, text: 'Daniel Buyinza' },
            { id: 5, text: 'Muhwezi Jerald' },
          ],
        },
      ],
    };

    this.changeMainResource = this.changeMainResource.bind(this);
  }

  changeMainResource(mainResourceName) {
    this.setState({ mainResourceName });
  }

  render() {
    const { data, resources, mainResourceName } = this.state;

    return (
      <Layout>
        <ResourceSwitcher
          resources={resources}
          mainResourceName={mainResourceName}
          onChange={this.changeMainResource}
        />

        <Paper>
          <Scheduler
            data={data}
          >
            <ViewState
              defaultCurrentDate="2018-06-27"
            />
            <WeekView
              startDayHour={11.5}
              endDayHour={16}
            />
            <MonthView />
            <Appointments />
            <AppointmentTooltip />
            <Resources
              data={resources}
              mainResourceName={mainResourceName}
            />
          </Scheduler>
        </Paper>
      </Layout>
    );
  }
}
