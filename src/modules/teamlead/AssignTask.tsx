import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import { reqDate, reqObject, reqString, reqArray } from "../../data/validations";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XDateInput from "../../components/inputs/XTimeInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import { toOptions } from "../../components/inputs/inputHelpers";
import { remoteRoutes } from "../../data/constants";
import { useDispatch } from 'react-redux';
import { servicesConstants } from "../../data/teamlead/reducer";
import { post, put } from "../../utils/ajax";
import Toast from "../../utils/Toast";
import { XRemoteSelect } from "../../components/inputs/XRemoteSelect";
import { Box, TextField } from "@material-ui/core";
import { ICreateDayDto, ISaveToATT, ISaveToUTT } from "./types";
import { isoDateString } from "../../utils/dateHelpers";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
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

    return (
        <Box p={1} className={classes.root}>
            <Header title="Assign Volunteers Task" />
            <Grid item xs={6}>
                <XForm
                    onSubmit={handleSubmit}
                    schema={schema}
                    initialValues={initialValues}
                >
                    <Grid spacing={0} container>
                        <Grid item xs={12}>
                            <XRemoteSelect
                                remote={remoteRoutes.tasks}
                                filter={{ 'taskName[]': '' }}
                                parser={({ taskName, id }: any) => ({ label: taskName, value: id })}
                                name="taskId"
                                label="Task Name"
                                variant='outlined'
                            />
                        </Grid>
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
                        <Grid item xs={12}>
                            <XRemoteSelect
                                multiple
                                remote={remoteRoutes.contactsPerson}
                                filter={{ 'firstName[]+" "+lastName[]': 'Volunteer' }}
                                parser={({ firstName, lastName, id }: any) => ({ label: firstName + " " + lastName, value: id })}
                                name="userId"
                                label="Volunteers"
                                variant='outlined'
                            />
                        </Grid>
                    </Grid>
                </XForm>
            </Grid>
        </Box>
    );
}

export default AssignTask;