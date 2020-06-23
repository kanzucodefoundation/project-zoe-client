import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
    Scheduler,
    Resources,
    WeekView,
    MonthView,
    DayView,
    ViewSwitcher,
    Toolbar,
    DateNavigator,
    Appointments,
    AppointmentTooltip,
} from '@devexpress/dx-react-scheduler-material-ui';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import ColorLens from '@material-ui/icons/ColorLens';
import { remoteRoutes } from "../../data/constants";
import Layout from "../../components/layout/Layout";
import { owners } from '../../data/teamlead/tasks';



const currentDate = new Date();
const views = ['day', 'week', 'workWeek', 'month'];


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
        mainResourceName,
        onChange,
        classes,
        resources,
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

const FlexibleSpace = withStyles(styles, { name: 'ToolbarRoot' })(({ classes, ...restProps }) => (
  <Toolbar.FlexibleSpace {...restProps} className={classes.flexibleSpace}>
    <div className={classes.flexContainer}>
      <ColorLens fontSize="large" htmlColor="#FF7043" />
      <Typography variant="h5" style={{ marginLeft: '10px' }}>Scheduler</Typography>
    </div>
  </Toolbar.FlexibleSpace>
));

export default class Volunteer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            mainResourceName: 'Volunteers',
            resources: [{
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
                    fieldName: 'ownerId',
                    title: 'Volunteers',
                    allowMultiple: true,
                    instances: [owners],
                },
            ],
        };

        this.changeMainResource = this.changeMainResource.bind(this);
    }

    changeMainResource(mainResourceName) {
        this.setState({ mainResourceName });
    }

   async componentDidMount() {

        const res = await fetch(remoteRoutes.appointments);
        const json = await res.json();
        console.log(json);

        const appoints = [];
        json.map((item, index) => {
            appoints.push({
                id: item["id"],
                taskId: item["taskId"],
                startDate: new Date(item["startDate"]),
                endDate: new Date(item["endDate"]),
                title: item["taskInfo"],
                


            })
            return ""
        });

        console.log(appoints);
        this.setState({
            data: appoints
        })
    }

    async componentDidMount() {

        const res = await fetch(remoteRoutes.userTask);
        const json = await res.json();
        console.log(json);
        
        const appoints = [];
        json.map((item, index) => {
            appoints.push({
               userId: item["userId"],               


            })
            return ""
        });

        console.log(appoints);
        this.setState({
            data: appoints
        })
    }

    render() {
        const { data, resources, mainResourceName, currentDate } = this.state;

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
            views={views}
            defaultCurrentView = "month"
          >
            <ViewState
              defaultCurrentDate={currentDate}
            />
            <WeekView
              startDayHour={9}
              endDayHour={19}
            />
            <DayView
              startDayHour={0}
              endDayHour={24}
            />
            <MonthView />

            <Appointments />
            <AppointmentTooltip />
            
            <Resources
              data={resources}
              mainResourceName={mainResourceName}
            />
            <Toolbar
            flexibleSpaceComponent={FlexibleSpace}
            /> 
            <ViewSwitcher />
            <DateNavigator / >
          </Scheduler>
        </Paper>
      </Layout>

        );
    }

}