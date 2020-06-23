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
    ministry: '',
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
    const [persons, setPersons] = useState<any>({id: 0, contactId: 0, firstName: "", email: "", listOfPersons: []});
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
        const toSave: ICreateAVolunteerDto = {         
            username: persons.email,
            password: Math.random().toString(36).slice(2) +  
            Math.random().toString(36) 
                .toUpperCase().slice(2), // Each volunteer has a random password stored in the database
            contactId: persons.contactId,
            roles: ["VOLUNTEER"]
        }
        
        const toSaveToGroupMemberships: ICreateAMembershipDto = {
            groupId: values.ministry.value,
            contactId: persons.contactId,
            role: "Volunteer",
        }

        // Add person to user table
        post(remoteRoutes.users, toSave,
            () => {
                // Then send email to new volunteer
                // get a instance of sendgrid and set the API key
                const sendgrid = require('@sendgrid/mail');
                sendgrid.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);// construct an email
                const email = {
                to: 'd.buyinza@student.ciu.ac.ug', // TODO: Remember to change this to a variable to pick the actual email of person when deploying to production
                from: process.env.REACT_APP_FROM, // must include email address of the sender
                subject: 'You have been added as a Volunteer',
                html: 'Hello ' + persons.firstName + ', <br>You have been added as a new volunteer at Worship Harvest Ministries serving in the ' + values.ministry.label + ' ministry. <br><br>Please use these details to log into your account on our platform; <br> Link to the platform: https://app.worshipharvest.org/ <br>Your email address: ' + persons.email + '<br>Your password: ' + toSave.password + '<br><br>You are most welcome!',
                };// send the email via sendgrid
                sendgrid.send(email)
                .then(() => { Toast.info("A welcome email has been sent to the new volunteer") }, (error: { response: { body: any; }; }) => {
                    console.error(error);
                 
                    if (error.response) {
                      console.error(error.response.body)
                    }
                  });

                // Add person to group_membership table
                post(remoteRoutes.groupsMemberships, toSaveToGroupMemberships,
                    (data) => {
                        Toast.info('Operation successful')
                        actions.resetForm()
                        dispatch({
                            type: servicesConstants.servicesAddVolunteer,
                            payload: {...data},
                        })
                    }
                )
                if (done) {
                    done()
                }
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

            Promise.all([getEmail, getPerson]).then(async ([email, person]) => {
                const fetchedEmail = await email.json()
                const pickedPerson = await person.json()
                
                setPersons({
                    ...persons,
                    id: value.id,
                    email: fetchedEmail.value,
                    contactId: fetchedEmail.contactId,
                    firstName: pickedPerson[0].firstName
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
                                getOptionLabel={(option) => option.firstName + " " + option.lastName}
                                onChange={(event: any, value: any) => handleChange(value)} // prints the selected value
                                renderInput={(params) => (
                                <TextField {...params} label="Search for person to add as Volunteer" margin="normal" variant="outlined" />
                                )}
                            />

                            <Grid spacing={0} container>
                                <Grid item xs={12}>
                                    <XRemoteSelect
                                        remote={remoteRoutes.groupsCombo}
                                        filter={{'categories[]': 'M'}}
                                        parser={({name, id}: any) => ({label: name, value: id})}
                                        name="ministry"
                                        label="Ministry"
                                        variant='outlined'
                                    />
                                </Grid>
                            </Grid>

                            <Autocomplete
                                id="tags-outlined"
                                multiple
                                options={persons.listOfPersons}
                                getOptionLabel={(option) => option.firstName + " " + option.lastName}
                                filterSelectedOptions
                                onChange={(event: any, value: any) => handleChange(value)} // prints the selected value
                                renderInput={(params) => (
                                <TextField {...params} label="Ministries" margin="normal" variant="outlined" />
                                )}
                            />
                        </XForm>
                        <p>* To add a volunteer to another ministry group, go to View volunteers and click their name to edit their details.</p>
                    </CardContent>
                </Card>
            </Grid>

            <br />
        </Box>
      </Navigation>
    );
}


export default AddVolunteersForm;