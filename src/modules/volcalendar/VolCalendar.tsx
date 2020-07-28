import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import {
    Scheduler,
    Toolbar,
    MonthView,
    WeekView,
    DayView,
    ViewSwitcher,
    Appointments,
    AppointmentTooltip,
    AppointmentForm,
    DragDropProvider,
    EditRecurrenceMenu,
    AllDayPanel,
    DateNavigator,
} from '@devexpress/dx-react-scheduler-material-ui';
import { connectProps } from '@devexpress/dx-react-core';

import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';


import Close from '@material-ui/icons/Close';
import Layout from "../../components/layout/Layout";
import BlockDate from './BlockDate'
import { remoteRoutes } from "../../data/constants";
// import { data, holidays } from './data';
// import Utils from './utils.js';
// import DataCell from './DataCell.js';
// import DateCell from './DateCell.js';
// import TimeCell from './TimeCell.js';
// import notify from 'devextreme/ui/notify';

const data = [{
    taskId: 'Website Re-Design Plan',
    startDate: new Date(2020, 6, 28, 9, 35),
    endDate: new Date(2020, 6, 28, 11, 30),
    id: 0,
    userId: 'Room 1',
}];





interface IProps {
    data: any | null
    done ? : () => any
}

const containerStyles = (theme: Theme) => createStyles({
    container: {
        width: theme.spacing(68),
        padding: 0,
        paddingBottom: theme.spacing(2),
    },
    content: {
        padding: theme.spacing(2),
        paddingTop: 0,
        minWidth: 150,
        maxWidth: 200,
    },
    header: {
        overflow: 'hidden',
        paddingTop: theme.spacing(0.5),
    },
    closeButton: {
        float: 'left',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 2),
    },
    button: {
        marginLeft: theme.spacing(2),
    },
    picker: {
        marginRight: theme.spacing(2),
        '&:last-child': {
            marginRight: 0,
        },
        width: '50%',
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 0),
    },
    icon: {
        margin: theme.spacing(2, 0),
        marginRight: theme.spacing(2),
    },
    textField: {
        width: '100%',
    },
});

class AppointmentFormContainerBasic extends React.PureComponent {
    getAppointmentData: () => any;
    getAppointmentChanges: () => any;
    constructor(props: any) {
        super(props);

        this.state = {
            appointmentChanges: {},
        };

        this.getAppointmentData = () => {
            const { appointmentData }: any = this.props;
            return appointmentData;
        };
        this.getAppointmentChanges = () => {
            const { appointmentChanges }: any = this.state;
            return appointmentChanges;
        };

        this.changeAppointment = this.changeAppointment.bind(this);
        this.commitAppointment = this.commitAppointment.bind(this);
    }

    changeAppointment({ field, changes }: any) {
        const nextChanges = {
            ...this.getAppointmentChanges(),
            [field]: changes,
        };
        this.setState({
            appointmentChanges: nextChanges,
        });
    }

    commitAppointment(type: any) {
        const { commitChanges }: any = this.props;
        const appointment = {
            ...this.getAppointmentData(),
            ...this.getAppointmentChanges(),
        };
        if (type === 'deleted') {
            commitChanges({
                [type]: appointment.id });
        } else if (type === 'changed') {
            commitChanges({
                [type]: {
                    [appointment.id]: appointment } });
        } else {
            commitChanges({
                [type]: appointment });
        }
        this.setState({
            appointmentChanges: {},
        });
    }

    render() {
        const {
            classes,
            visible,
            visibleChange,
            appointmentData,
            cancelAppointment,
            target,
            onHide,
        }: any = this.props;
        const { appointmentChanges }: any = this.state;

        const displayAppointmentData = {
            ...appointmentData,
            ...appointmentChanges,
        };

        const isNewAppointment = appointmentData.id === undefined;


        const cancelChanges = () => {
            this.setState({
                appointmentChanges: {},
            });
            visibleChange();
            cancelAppointment();
        };

        return (
            <AppointmentForm.Overlay
                visible={visible}
                target={target}
                fullSize
                onHide={onHide}
            >
                <div className={classes.header}>
                    <IconButton
                        className={classes.closeButton}
                        onClick={cancelChanges}
                    >
                        <Close color="action" />
                    </IconButton>
                </div>
                <BlockDate data={{}} />
            </AppointmentForm.Overlay>

        );
    }
}

const AppointmentFormContainer = withStyles(containerStyles, { name: 'AppointmentFormContainer' })(AppointmentFormContainerBasic);

const styles = (theme: Theme) => createStyles({
    addButton: {
        position: 'absolute',
        bottom: theme.spacing(1) * 3,
        right: theme.spacing(1) * 4,
    },
});

/* eslint-disable-next-line react/no-multi-comp */
class VolunteerCalendar extends React.PureComponent {
    appointmentForm: (React.ComponentClass < any, any > & { update(): void; }) | (React.FunctionComponent < any > & { update(): void; });
    cancelDelete: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined;
    constructor(props: any) {
        super(props);
        this.state = {
            data: data,
            currentDate: new Date(),
            confirmationVisible: false,
            editingFormVisible: false,
            deletedAppointmentId: undefined,
            editingAppointment: undefined,
            previousAppointment: undefined,
            addedAppointment: {},
            startDayHour: 9,
            endDayHour: 19,
            isNewAppointment: false,
        };

        this.toggleConfirmationVisible = this.toggleConfirmationVisible.bind(this);
        this.commitDeletedAppointment = this.commitDeletedAppointment.bind(this);
        this.toggleEditingFormVisibility = this.toggleEditingFormVisibility.bind(this);

        this.commitChanges = this.commitChanges.bind(this);
        this.onEditingAppointmentChange = this.onEditingAppointmentChange.bind(this);
        this.onAddedAppointmentChange = this.onAddedAppointmentChange.bind(this);
        this.appointmentForm = connectProps(AppointmentFormContainer, () => {
            const {
                editingFormVisible,
                editingAppointment,
                data,
                addedAppointment,
                isNewAppointment,
                previousAppointment,
            }: any = this.state;

            const currentAppointment = data
                .filter((appointment: { id: any; }) => editingAppointment && appointment.id === editingAppointment.id)[0] ||
                addedAppointment;
            const cancelAppointment = () => {
                if (isNewAppointment) {
                    this.setState({
                        editingAppointment: previousAppointment,
                        isNewAppointment: false,
                    });
                }
            };

            return {
                visible: editingFormVisible,
                appointmentData: currentAppointment,
                commitChanges: this.commitChanges,
                visibleChange: this.toggleEditingFormVisibility,
                onEditingAppointmentChange: this.onEditingAppointmentChange,
                cancelAppointment,
            };
        });
        
    }
   

    async componentDidMount() {        
        const res = await fetch(remoteRoutes.singleUserTask + '/' + sessionStorage.getItem('id'));
        // console.log('xxxxxxxzzzzzz', res);
        const json = await res.json();
        console.log('zzzzzzzz')
        console.log(json);

        const appoints: any = [];
        json.map((item: any, index: any) => {
            appoints.push({
                id: item.id,
                // title: item.appTask["task"],
                // startDate: item.appTask.app.startDate,
                // endDate: item.appTask.app.endDate,
                owner: item.user.firstName,
                })

            return ""
        });
            
       

        console.log('bbbccc', appoints);
        this.setState({
            data: appoints
        })
    }



    componentDidUpdate() {
        this.appointmentForm.update();
    }

    onEditingAppointmentChange(editingAppointment: any) {
        this.setState({ editingAppointment });
    }

    onAddedAppointmentChange(addedAppointment: any) {
        this.setState({ addedAppointment });
        const { editingAppointment }: any = this.state;
        if (editingAppointment !== undefined) {
            this.setState({
                previousAppointment: editingAppointment,
            });
        }
        this.setState({ editingAppointment: undefined, isNewAppointment: true });
    }

    setDeletedAppointmentId(id: any) {
        this.setState({ deletedAppointmentId: id });
    }

    toggleEditingFormVisibility() {
        const { editingFormVisible }: any = this.state;
        this.setState({
            editingFormVisible: !editingFormVisible,
        });
    }

    toggleConfirmationVisible() {
        const { confirmationVisible }: any = this.state;
        this.setState({ confirmationVisible: !confirmationVisible });
    }

    commitDeletedAppointment() {
        this.setState((state) => {
            const { data, deletedAppointmentId }: any = state;
            const nextData = data.filter((appointment: { id: any; }) => appointment.id !== deletedAppointmentId);

            return { data: nextData, deletedAppointmentId: null };
        });
        this.toggleConfirmationVisible();
    }

    commitChanges({ added, changed, deleted }: any) {
        this.setState((state) => {
            let { data }: any = state;
            if (added) {
                const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
                data = [...data, { id: startingAddedId, ...added }];
            }
            if (changed) {
                data = data.map((appointment: { id: React.ReactText; }) => (
                    changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
            }
            if (deleted !== undefined) {
                this.setDeletedAppointmentId(deleted);
                this.toggleConfirmationVisible();
            }
            return { data, addedAppointment: {} };
        });
    }

    render() {
        const {
            currentDate,
            data,
            confirmationVisible,
            editingFormVisible,
            startDayHour,
            endDayHour,
        }: any = this.state;
        const { classes }: any = this.props;

        return (
            <Layout>
                <Paper>
                    <Scheduler
                        data={data}
                        height={660}
                    >
                        
                        <EditingState
                            onCommitChanges={this.commitChanges}
                            onEditingAppointmentChange={this.onEditingAppointmentChange}
                            onAddedAppointmentChange={this.onAddedAppointmentChange}
                        />
                        <ViewState
                            currentDate={currentDate}
                        />
                        <MonthView />

                        <WeekView
                            startDayHour={startDayHour}
                            endDayHour={endDayHour}
                        />
                        <DayView
                            startDayHour={0}    
                            endDayHour={24}
                        />

                        <AllDayPanel />
                        <Appointments />
                       
                        <Toolbar />
                        <DateNavigator />

                        <EditRecurrenceMenu />
                      
                        <AppointmentTooltip                            
                            showCloseButton                            
                        />
                        
                       
                        <ViewSwitcher />
                        <AppointmentForm
                            overlayComponent={this.appointmentForm}
                            visible={editingFormVisible}
                            onVisibilityChange={this.toggleEditingFormVisibility}
                        />
                        <DragDropProvider />
                    </Scheduler>

                    <Dialog
                        open={confirmationVisible}
                        onClose={this.cancelDelete}
                    >
                        <DialogTitle>
                            Delete Appointment
                        </DialogTitle>

                        <DialogContent>

                            <DialogContentText>
                                Are you sure you want to delete this appointment?
                            </DialogContentText>

                        </DialogContent>

                        <DialogActions>
                        
                            <Button onClick={this.toggleConfirmationVisible} color="primary" variant="outlined">
                                Cancel
                            </Button>

                            <Button onClick={this.commitDeletedAppointment} color="secondary" variant="outlined">
                                Delete
                            </Button>

                        </DialogActions>

                    </Dialog>

                    <Fab
                        color="secondary"
                        className={classes.addButton}
                        onClick={() => {
                            this.setState({ editingFormVisible: true });
                            this.onEditingAppointmentChange(undefined);
                            this.onAddedAppointmentChange({
                                startDate: new Date(currentDate).setHours(startDayHour),
                                endDate: new Date(currentDate).setHours(startDayHour + 1),
                            });
                        }}
                    >
                        <AddIcon />
                    </Fab>
                </Paper>
            </Layout>
        );
    }
}

export default withStyles(styles, { name: 'EditingCalendar' })(VolunteerCalendar);