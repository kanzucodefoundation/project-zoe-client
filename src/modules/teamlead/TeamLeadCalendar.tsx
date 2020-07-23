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
import { KeyboardDateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
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
import LocationOn from '@material-ui/icons/LocationOn';
import Notes from '@material-ui/icons/Notes';
import Close from '@material-ui/icons/Close';
import CalendarToday from '@material-ui/icons/CalendarToday';
import Create from '@material-ui/icons/Create';
import Layout from "../../components/layout/Layout";
import { remoteRoutes } from "../../data/constants";

import { useState, useEffect } from 'react';
import * as yup from "yup";
import { reqDate, reqObject, reqString, reqArray } from "../../data/validations";
import { FormikHelpers, Formik } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XDateInput from "../../components/inputs/XTimeInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import { toOptions } from "../../components/inputs/inputHelpers";
import { useDispatch } from 'react-redux';
import { servicesConstants } from "../../data/teamlead/reducer";
import { post, put } from "../../utils/ajax";
import Toast from "../../utils/Toast";
import { XRemoteSelect } from "../../components/inputs/XRemoteSelect";
import { Box, TextField } from "@material-ui/core";
import { ICreateDayDto, ISaveToATT, ISaveToUTT } from "./types";
import { isoDateString } from "../../utils/dateHelpers";
import { makeStyles } from "@material-ui/core";
import Header from "./Header";
import { owners } from '../../data/teamlead/tasks';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import { enumToArray } from "../../utils/stringHelpers";
import { ministryCategories } from "../../data/comboCategories";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { id } from 'date-fns/locale';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';



const containerStyles = (theme: Theme) => createStyles({
    container: {
        width: theme.spacing(68),
        padding: 0,
        paddingBottom: theme.spacing(2),
    },
    content: {
        padding: theme.spacing(2),
        paddingTop: 0,
    },
    header: {
        overflow: 'hidden',
        paddingTop: theme.spacing(0.5),
    },
    closeButton: {
        float: 'right',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-left',
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


// const data = [
//     {
//       taskId: 'Website Re-Design Plan',
//       startDate: new Date(2020, 6, 28, 9, 35),
//       endDate: new Date(2020, 6, 28, 11, 30),
//       id: 0,
//       userId: 'Room 1',
//     }
//   ];


const data = [
    {
      taskId: 'Website Re-Design Plan',
      startDate: new Date(2020, 6, 28, 9, 35),
      endDate: new Date(2020, 6, 28, 11, 30),
      id: 0,
      userId: 'Room 1',
    }
  ];





  interface IProps {
    data: any | null
    done?: () => any
}

const schema = yup.object().shape(
    {
        taskId: reqObject,
        startDate: reqDate,
        endDate: reqDate,
        userId: reqArray,
    }
)

const initialValues = {
    taskId: '',
    startDate: '',
    endDate: '',
    userId: [],
}

const RightPadded = ({ children, ...props }: any) => <Grid item xs={6}>
    <Box pr={1} {...props}>
        {children}
    </Box>
</Grid>

const LeftPadded = ({ children, ...props }: any) => <Grid item xs={6}>
    <Box pl={1} {...props}>
        {children}
    </Box>
</Grid>

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
            maxWidth: 300,
        },
        root: {
            flexGrow: 1,
        },
        filterPaper: {
            borderRadius: 0,
            padding: theme.spacing(2)
        },
        fab: {
            position: 'absolute',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
        icon: {
            margin: theme.spacing(2, 0),
            marginRight: theme.spacing(2),
        },
        wrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: theme.spacing(1, 0),
        },
        content: {
            padding: theme.spacing(2),
            paddingTop: 0,
        },
        textField: {
            width: '100%',
        },
    }),
);

const AssignTask = ({ done }: IProps) => {
    
    const dispatch = useDispatch();
    const classes = useStyles();
    function appointmentTasks(values: any, actions: any, id: any) {
        const toSaveAppointmentTaskTable: ISaveToATT = {
            appointmentId: id,
            taskId: values.taskId.value,
        }

        post(remoteRoutes.appointmentTask, toSaveAppointmentTaskTable,
            (data) => {
                console.log("appointment")
                userTask(values, actions, data.id)
            },
            undefined,
            () => {
                actions.setSubmitting(false);
            }
        )
    }

    function userTask(values: any, actions: any, id: any) {
        console.log("tasksffff")
        console.log(values)
        console.log(values.userId)
        values.userId.map((item: any, index: any) => {
            const toSaveUserTaskTable: ISaveToUTT = {
                appointmentTaskId: id,
                userId: item.value,
            }
            post(remoteRoutes.userTask, toSaveUserTaskTable,
                (data) => {
                    console.log("usertask")
                    if (index === values.userId.length - 1) {
                        Toast.info('Operation successful')
                        actions.resetForm()
                        dispatch({
                            type: servicesConstants.servicesAddDay,
                            payload: { ...data },
                        })
                        if (done)
                            done()
                    }
                },
                undefined,
                () => {
                    actions.setSubmitting(false);
                    console.log("data")
                }

            )
        })
    }

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: ICreateDayDto = {
            startDate: values.startDate,
            endDate: values.endDate,
        }
        console.log(values)

        post(remoteRoutes.appointments, toSave,
            (data) => {
                console.log(data, data.id)
                appointmentTasks(values, actions, data.id);
            },
            undefined,
            () => {
                actions.setSubmitting(false);
            }
        )
    }

    const [persons, setPersons] = useState<any>({ id: 0, contacts: [], listOfPersons: [] });
    useEffect(() => {
        const fetchPersons = async () => {
            const result = await fetch(remoteRoutes.contactsPerson).then(
                response => response.json()
            )
            setPersons({
                ...persons,
                listOfPersons: result
            });
        }
        fetchPersons();
    }, []);

    const handleChange = (value: any) => {
        let contacts: number[] = [];
        for (let index = 0; index < value.length; index++) {
            const user = value[index];
            contacts.push(user.contactId)
        }
        setPersons({
            ...persons,
            contacts: contacts,
        });
    }


    // changeAppointment({ field, changes }: any) {
    //     const nextChanges = {
    //         ...this.getAppointmentChanges(),
    //         [field]: changes,
    //     };
    //     this.setState({
    //         appointmentChanges: nextChanges,
    //     });
    // }

    // const displayAppointmentData = {
    //     ...appointmentData,
    //     ...appointmentChanges,
    // };


    // const textEditorProps = (field: string) => ({
    //     // variant: 'outlined |filled | standard| undefined',
    //     onChange: ({ target: change }: any) => this.changeAppointment({
    //         field: [field], changes: change.value,
    //     }),
    //     value: displayAppointmentData[field] || '',
    //     label: field[0].toUpperCase() + field.slice(1),
    //     className: classes.textField,
    // });

    return (
        <Box p={1} className={classes.root}>
            <Header title="Assign Volunteers Task" />
            {/* <Grid item xs={12}> */}
                <XForm
                    onSubmit={handleSubmit}
                    schema={schema}
                    initialValues={initialValues}
                >
                    <div className={classes.content}>
                        <div className={classes.wrapper}>
                                <Create className={classes.icon} color="action" />
                            <XRemoteSelect
                                remote={remoteRoutes.tasks}
                                filter={{ 'taskName[]': '' }}
                                parser={({ taskName, id }: any) => ({ label: taskName, value: id })}
                                name="taskId"
                                label="Task Name"
                                variant='outlined'
                                // {...textEditorProps('Task Name')}
                            />
                            </div>
                        <div className={classes.wrapper}>
                                <CalendarToday className={classes.icon} color="action" />
                        <RightPadded>
                            <XDateInput
                                name="startDate"
                                label="Start Date"
                            />
                        </RightPadded>
                        <LeftPadded>
                            <XDateInput
                                name="endDate"
                                label="End Date"
                            />
                        </LeftPadded>
                        </div>
                        <div className={classes.wrapper}>
                        <EmojiPeopleIcon className={classes.icon} color="action" />
                            <XRemoteSelect
                                multiple
                                remote={remoteRoutes.contactsPerson}
                                filter={{ 'firstName[]+" "+lastName[]': 'Volunteer' }}
                                parser={({ firstName, lastName, id }: any) => ({ label: firstName + " " + lastName, value: id })}
                                name="userId"
                                label="Volunteers"
                                variant='outlined'
                            />
                             </div>
                    </div>
                </XForm>
            {/* </Grid> */}
        </Box>
    );
}







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
            commitChanges({ [type]: appointment.id });
        } else if (type === 'changed') {
            commitChanges({ [type]: { [appointment.id]: appointment } });
        } else {
            commitChanges({ [type]: appointment });
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
        const applyChanges = isNewAppointment
            ? () => this.commitAppointment('added')
            : () => this.commitAppointment('changed');

        const textEditorProps = (field: string) => ({
            // variant: 'outlined |filled | standard| undefined',
            onChange: ({ target: change }: any) => this.changeAppointment({
                field: [field], changes: change.value,
            }),
            value: displayAppointmentData[field] || '',
            label: field[0].toUpperCase() + field.slice(1),
            className: classes.textField,
        });

        const pickerEditorProps = (field: string) => ({
            className: classes.picker,
            keyboard: true,
            ampm: false,
            value: displayAppointmentData[field],
            onChange: (date: { toDate: () => any; }) => this.changeAppointment({
                field: [field], changes: date ? date.toDate() : new Date(displayAppointmentData[field]),
            }),
            inputVariant: 'outlined',
            format: 'DD/MM/YYYY HH:mm',
            onError: () => null,
        });

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
                fullSize={false}
                onHide={onHide}
            >
                <div>
                <div className={classes.header}>
            <IconButton
              className={classes.closeButton}
              onClick={cancelChanges}
            >
              <Close color="action" />
            </IconButton>
          </div>
          <AssignTask data={{}}  />
          <div className={classes.buttonGroup}>
                        {!isNewAppointment && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                className={classes.button}
                                onClick={() => {
                                    visibleChange();
                                    this.commitAppointment('deleted');
                                }}
                            >
                                Delete
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            color="primary"
                            className={classes.button}
                            onClick={() => {
                                visibleChange();
                                applyChanges();
                            }}
                        >
                            {isNewAppointment ? 'Create' : 'Save'}
                        </Button>
                    </div>
                    
                    

</div>
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
class TeamLeadCalendar extends React.PureComponent {
    appointmentForm: (React.ComponentClass<any, any> & { update(): void; }) | (React.FunctionComponent<any> & { update(): void; });
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
                .filter((appointment: { id: any; }) => editingAppointment && appointment.id === editingAppointment.id)[0]
                || addedAppointment;
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

        const res = await fetch(remoteRoutes.userTasks);
        const json = await res.json();
        console.log('xxxyyyy', json);

        const appoints: any = [];
        json.map((item: any, index: any) => {
            appoints.push({
                id: item["id"],
                title: item.appTask.task["taskName"],
                startDate: new Date(item.appTask.app["startDate"]),
                endDate: new Date(item.appTask.app["endDate"]),
                location: item.user["firstName "],
            })
            return ""
        });

        // console.log(appoints);
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
                            showOpenButton
                            showCloseButton
                            showDeleteButton
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

export default withStyles(styles, { name: 'EditingCalendar' })(TeamLeadCalendar);