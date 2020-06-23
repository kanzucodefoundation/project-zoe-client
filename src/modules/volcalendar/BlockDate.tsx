import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import { reqDate, reqObject, reqString } from "../../data/validations";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";

import {remoteRoutes} from "../../data/constants";
import {useDispatch} from 'react-redux';
import {servicesConstants} from "../../data/volunteers/reducer";
import {post} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import {Box} from "@material-ui/core";
import {ICreateABlockDateDto} from "./types";
import XDateInput from "../../components/inputs/XTimeInput";

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';

interface IProps {
    data: any | null
    done?: () => any
}

// const schema = yup.object().shape(
//     {
//         ministry: reqString,
//     }
// )

// const initialValues = {
//     ministry: '',
// }

const schema = yup.object().shape(
    {
        taskId: reqObject,
        startDate: reqDate,
        endDate: reqDate,
        taskInfo: reqString,
        userId: reqObject,

    }
)

const initialValues = {

    taskId: '',
    startDate: '',
    endDate: '',
    taskInfo: '',
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

const BlockDateForm = ({done}: IProps) => {
    const dispatch = useDispatch();
    const classes = useStyles();

    // Retrieve all persons so that the volunteer may be selected
    const [persons, setPersons] = useState<any>({id: 0, contactId: 0, email: "", listOfPersons: []});
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

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: ICreateABlockDateDto = {         
            username: persons.email,
            password: 'new_volunteer', // The default password for each new volunteer
            contactId: persons.contactId,
            roles: ["VOLUNTEER"],
            taskInfo: values.taskInfo, 
            startDate: values.startDate,
            endDate: values.endDate
        }
        
        // const toSaveToGroupMemberships: ICreateAMembershipDto = {
        //     groupId: values.ministry.value,
        //     contactId: persons.contactId,
        //     role: "Volunteer",
        // }

        // Add person to user table
        // post(remoteRoutes.users, toSave,
        //     () => {
        //         // Add person to group_membership table
        //         post(remoteRoutes.groupsMemberships, toSaveToGroupMemberships,
        //             (data) => {
        //                 Toast.info('Operation successful')
        //                 actions.resetForm()
        //                 dispatch({
        //                     type: servicesConstants.servicesAddVolunteer,
        //                     payload: {...data},
        //                 })
        //             }
        //         )
        //         if (done) {
        //             done()
        //         }
        //     },
        //     undefined,
        //     () => {
        //         actions.setSubmitting(false);
        //     }
        // )
    }

    const handleChange = (value: any) => {
        const fetchEmail = async () => {
            const fetchedEmail = await fetch(remoteRoutes.contactsEmail + "/" + value.id).then(
                response => response.json()
            )

            setPersons({
                ...persons,
                id: value.id,
                email: fetchedEmail.value,
                contactId: fetchedEmail.contactId,
            });
        }
        fetchEmail();
    }

    return (
      <Navigation>
        <Box p={1} className={classes.root}>
            <Header title="Block A Date" />

            <Grid item xs={6}>
                <Card className={classes.root}>
                    <CardContent>
                        <XForm
                            onSubmit={handleSubmit}
                            schema={schema}
                            initialValues={initialValues}
                        >

                            <Autocomplete
                                id="free-solo-demo"
                                freeSolo
                                options={persons.listOfPersons}
                                getOptionLabel={(option) => option.firstName + " " + option.lastName}
                                onChange={(event: any, value: any) => handleChange(value)} // prints the selected value
                                renderInput={(params) => (
                                <TextField {...params} label="Enter Volunteer Name" margin="normal" variant="outlined" />
                                )}
                            />

                            <XRemoteSelect
                                remote={remoteRoutes.tasks}
                                filter={{ 'taskName[]': '' }}
                                parser={({ taskName, id }: any) => ({ label: taskName, value: id })}
                                name="taskId"
                                label="Task Name"
                                variant='outlined'
                            />

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

                            
                        </XForm>
                    </CardContent>
                </Card>
            </Grid>

            <br />
        </Box>
      </Navigation>
    );
}


export default BlockDateForm;
