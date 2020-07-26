import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import {reqString} from "../../data/validations";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";

import {remoteRoutes} from "../../data/constants";
import {useDispatch} from 'react-redux';
import {servicesConstants} from "../../data/volunteers/reducer";
import {post} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import {Box} from "@material-ui/core";
import {ICreateAVolunteerDto, ICreateAMembershipDto} from "./types";

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

const schema = yup.object().shape(
    {
        ministry: reqString,
    }
)

const initialValues = {
    ministry: [],
}


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

const AddVolunteersForm = ({done}: IProps) => {
    const dispatch = useDispatch();
    const classes = useStyles();

    // Retrieve all persons so that the volunteer may be selected
    const [persons, setPersons] = useState<any>({id: 0, contactId: 0, firstName: "", email: "", listOfPersons: [], ministriesIn: [], ministriesNotIn: []});
    useEffect(() => {
        const fetchPersons = async () => {
            const result = await fetch(remoteRoutes.contactsPersonsAndTheirGroups).then(
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
        const toSave: ICreateAVolunteerDto = {         
            username: persons.email,
            password: Math.random().toString(36).slice(2) +  
            Math.random().toString(36) 
                .toUpperCase().slice(2), // Each volunteer has a random password stored in the database
            contactId: persons.contactId,
            roles: ["VOLUNTEER"]
        }

        // Add person to user table
        post(remoteRoutes.users, toSave,
            () => {
                // Then send email to new volunteer
                // get a instance of sendgrid and set the API key
                const sendgrid = require('@sendgrid/mail');
                sendgrid.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);// construct an email
                const email = {
                to: persons.email,
                from: process.env.REACT_APP_FROM, // must include email address of the sender
                subject: 'You have been added as a Volunteer.',
                html: 'Hello ' + persons.firstName + ', <br>You have been added as a new volunteer at Worship Harvest Ministries serving with the ' + values.ministry.map((ministryTeam: any) => { return ministryTeam.label }).join(", ") + ' team. <br><br>Please use these details to log into your account on our platform; <br> Link to the platform: https://app.worshipharvest.org/ <br>Your email address: ' + persons.email + '<br>Your password: ' + toSave.password + '<br><br>You are most welcome!<br>Worship Harvest Ministries.',
                };// send the email via sendgrid
                sendgrid.send(email)
                .then(() => { Toast.info("A welcome email has been sent to the new volunteer") }, (error: { response: { body: any; }; }) => {
                    console.error(error);
                 
                    if (error.response) {
                      console.error(error.response.body)
                    }
                });

                values.ministry.map((item: any, index: any) => {
                    const toSaveToGroupMemberships: ICreateAMembershipDto = {
                        groupId: item.value,
                        contactId: persons.contactId,
                        role: "Volunteer",
                        isActive: true,
                    }
                    // Add person to group_membership table
                    post(remoteRoutes.groupsMemberships, toSaveToGroupMemberships,
                        (data) => {
                            if (index === values.groupId.length-1){
                                dispatch({
                                    type: servicesConstants.servicesAddVolunteer,
                                    payload: {...data},
                                })
                            }
                        }
                    )
                    if (done) {
                        done()
                    }
                })
                Toast.info('Operation successful')
                actions.resetForm()
            },
            undefined,
            () => {
                actions.setSubmitting(false);
            }
        )
    }

    const handleChange = (value: any) => {
        const fetchEmail = async () => {
            const getEmail = fetch(remoteRoutes.contactsEmail + "/" + value.id)
            const getPerson = fetch(remoteRoutes.contactsOnePerson + "/" + value.id)
            const getMinistries = fetch(remoteRoutes.ministries) // To check which ministries exist
            const getVolunteer = fetch(remoteRoutes.contactsPersonOneVolunteer + "/" + value.id) // For checking if a person is already a volunteer in any of the ministries

            Promise.all([getEmail, getPerson, getMinistries, getVolunteer]).then(async ([email, person, ministries, volunteer]) => {
                const fetchedEmail = await email.json()
                const pickedPerson = await person.json()
                const fetchedMinistries = await ministries.json()
                const pickedVolunteer = await volunteer.json()

                let ministryNames = fetchedMinistries.map((ministry: { name: any; }) => { return ministry.name })

                let notInTheseMinistries: string[] = []; // Ministries where the selected person is not in

                if (pickedVolunteer[0] === undefined) { // The picked person is not a volunteer attached to any ministry
                    notInTheseMinistries = [...ministryNames];
                } else { // Otherwise
                    var inTheseMinistries = pickedVolunteer[0].group.map((ministry: { name: any; }) => { return ministry.name }) // They are volunteers in this ministries

                    for (const ministry of ministryNames) {
                        if (!inTheseMinistries.includes(ministry)) {
                            notInTheseMinistries.push(ministry)
                        }
                    }
                }
                
                setPersons({
                    ...persons,
                    id: value.id,
                    email: fetchedEmail.value,
                    contactId: fetchedEmail.contactId,
                    firstName: pickedPerson[0].firstName,
                    ministriesIn: inTheseMinistries,
                    ministriesNotIn: notInTheseMinistries
                })
            }).catch(e => {
                console.log(e)
            })
        }
        fetchEmail();
    }

    return (
      <Navigation>
        <Box p={1} className={classes.root}>
            <Header title="Add volunteers" />

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
                                getOptionLabel={(option) => option.firstName + " " + option.lastName + " - [" + option.group.map((group: any) => { if (group.name === 'Music' || group.name === 'Guest Experience' || group.name === 'Media' || group.name === 'Kids') { return group.name } }).filter(Boolean).sort().join(", ") + "]"}
                                onChange={(event: any, value: any) => handleChange(value)} // prints the selected value
                                renderInput={(params) => (
                                <TextField {...params} label="Search for person to add as Volunteer" margin="normal" variant="outlined" />
                                )}
                            />

                            <Grid spacing={0} container>
                                <Grid item xs={12}>
                                    <XRemoteSelect
                                        multiple
                                        remote={remoteRoutes.groupsCombo}
                                        filter={{'categories[]': 'M'}}
                                        parser={({name, id}: any) => ({label: name, value: id})}
                                        name="ministry"
                                        label="Ministry"
                                        variant='outlined'
                                    />
                                </Grid>
                            </Grid>
                        </XForm>
                    </CardContent>
                </Card>
            </Grid>

            <br />
        </Box>
      </Navigation>
    );
}


export default AddVolunteersForm;