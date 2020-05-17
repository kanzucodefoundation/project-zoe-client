import React from 'react';
import * as yup from "yup";
import {reqDate, reqObject, reqString} from "../../data/validations";
import {ministryCategories} from "../../data/comboCategories";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XDateInput from "../../components/inputs/XDateInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import {toOptions} from "../../components/inputs/inputHelpers";

import {remoteRoutes} from "../../data/constants";
import {useDispatch} from 'react-redux';
import {servicesConstants} from "../../data/volunteers/reducer";
import {post} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import {XRemoteSelect} from "../../components/inputs/XRemoteSelect";
import {Box} from "@material-ui/core";
import {ICreateVolunteerDto} from "./types";
import {isoDateString} from "../../utils/dateHelpers";

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";

interface IProps {
    data: any | null
    done?: () => any
}

const schema = yup.object().shape(
    {
        ministry: reqString,
        firstName: reqString,
        surname: reqString,
        dateOfBirth: reqDate,
        missionalCommunity: reqObject,
        profession: reqString
    }
)

const initialValues = {

    ministry: '',
    firstName: '',
    surname: '',
    dateOfBirth: '',
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

        const toSave: ICreateVolunteerDto = {

            ministry: values.ministry,
            firstName: values.firstName,
            surname: values.surname,
            dateOfBirth: isoDateString(values.dateOfBirth),
            missionalCommunity: values.missionalCommunity.value,
            profession: values.profession,

        }

        post(remoteRoutes.volunteers, toSave,
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
                                name="surname"
                                label="Surname"
                                type="text"
                                variant='outlined'
                            />
                        </LeftPadded>
                        <Grid item xs={12}>
                            <XDateInput
                                name="dateOfBirth"
                                label="Date of Birth"
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
            </Grid>
        </Box>
      </Navigation>
    );
}


export default AddVolunteersForm;