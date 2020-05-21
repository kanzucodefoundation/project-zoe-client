import React from 'react';
import * as yup from "yup";
import {reqDate, reqObject, reqString, reqEmail} from "../../data/validations";
import {ministryCategories, civilStatusCategories, genderCategories} from "../../data/comboCategories";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XDateInput from "../../components/inputs/XDateInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import XRadioInput from "../../components/inputs/XRadioInput";
import {toOptions} from "../../components/inputs/inputHelpers";

import {remoteRoutes} from "../../data/constants";
import {useDispatch} from 'react-redux';
import {servicesConstants} from "../../data/volunteers/reducer";
import {post} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import {XRemoteSelect} from "../../components/inputs/XRemoteSelect";
import {Box} from "@material-ui/core";
import {ICreateAVolunteerDto} from "./types";
import {isoDateString} from "../../utils/dateHelpers";

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

interface IProps {
    data: any | null
    done?: () => any
}

const schema = yup.object().shape(
    {
        ministry: reqString,
        firstName: reqString,
        lastName: reqString,
        email: reqEmail,
        phone: reqString,
        dateOfBirth: reqDate,
        gender: reqString,
        civilStatus: reqString,
        missionalCommunity: reqObject,
        profession: reqString
    }
)

const initialValues = {
    ministry: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    civilStatus: '',
    missionalCommunity: null,
    profession: '',
}

const RightPadded = ({children,...props}: any) => <Grid item xs={6}>
    <Box pr={1} {...props}>
        {children}
    </Box>
</Grid>

const LeftPadded = ({children,...props}: any) => <Grid item xs={6}>
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

const AddVolunteersForm = ({done}: IProps) => {
    const dispatch = useDispatch();
    const classes = useStyles();

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: ICreateAVolunteerDto = {
            category: 'Volunteer',
            ministry: values.ministry,            
            firstName: values.firstName,
            lastName: values.lastName,
            civilStatus: values.civilStatus,
            phone: values.phone,
            email: values.email,
            password: 'new_volunteer', // The default password for each new volunteer
            dateOfBirth: values.dateOfBirth,
            gender: values.gender,
            missionalCommunity: values.missionalCommunity,
            profession: values.profession,
        }

        // contact
        post(remoteRoutes.contactsPerson, toSave,
            (data) => {
                Toast.info('Operation successful')
                actions.resetForm()
                dispatch({
                    type: servicesConstants.servicesAddVolunteer,
                    payload: {...data},
                })
                if (done)
                    done()
            },
            undefined,
            () => {
                actions.setSubmitting(false);
            }
        )
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
                            <Grid spacing={0} container>
                                <Grid item xs={12}>
                                    <XSelectInput
                                        name="ministry"
                                        label="Ministry"
                                        options={toOptions(ministryCategories)}
                                        variant='outlined'
                                    />
                                </Grid>
                                <RightPadded>
                                    <XTextInput
                                        name="firstName"
                                        label="First Name"
                                        type="text"
                                        variant='outlined'
                                    />
                                </RightPadded>
                                <LeftPadded>
                                    <XTextInput
                                        name="lastName"
                                        label="Last name"
                                        type="text"
                                        variant='outlined'
                                    />
                                </LeftPadded>
                                <RightPadded>
                                    <XTextInput
                                        name="email"
                                        label="Email"
                                        type="email"
                                        variant='outlined'
                                    />
                                </RightPadded>
                                <LeftPadded>
                                    <XTextInput
                                        name="phone"
                                        label="Phone"
                                        type="text"
                                        variant='outlined'
                                    />
                                </LeftPadded>
                                <RightPadded>
                                    <XDateInput
                                        name="dateOfBirth"
                                        label="Date of Birth"
                                        variant='outlined'
                                    />
                                </RightPadded>
                                <LeftPadded pt={3}>
                                    <XRadioInput
                                        name="gender"
                                        label=''
                                        options={toOptions(genderCategories)}
                                    />
                                </LeftPadded>
                                <Grid item xs={12}>
                                    <XSelectInput
                                        name="civilStatus"
                                        label="Civil Status"
                                        options={toOptions(civilStatusCategories)}
                                        variant='outlined'
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <XRemoteSelect
                                        remote={remoteRoutes.groupsCombo}
                                        filter={{'categories[]': 'MC'}}
                                        parser={({name, id}: any) => ({label: name, value: id})}
                                        name="missionalCommunity"
                                        label="Missional Community"
                                        variant='outlined'
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <XTextInput
                                        name="profession"
                                        label="Profession"
                                        type="text"
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