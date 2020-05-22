import React from 'react';
import * as yup from "yup";
import {reqEmail, reqObject, reqString} from "../../data/validations";
import {ageCategories, civilStatusCategories, genderCategories} from "../../data/comboCategories";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import {toOptions} from "../../components/inputs/inputHelpers";

import {remoteRoutes} from "../../data/constants";
import {useDispatch} from 'react-redux'
import {crmConstants} from "../../data/contacts/reducer";
import {post} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import XRadioInput from "../../components/inputs/XRadioInput";
import {XRemoteSelect} from "../../components/inputs/XRemoteSelect";
import {Box} from "@material-ui/core";

import {getDayList, getMonthsList, isoDateString} from "../../utils/dateHelpers";
import {ICreatePersonDto} from "../contacts/types";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

interface IProps {
    data: any | null
    done?: () => any
}

const schema = yup.object().shape(
    {
        firstName: reqString,
        lastName: reqString,
        // middleName: reqString,
        gender: reqString,
        birthDay: reqString,
        birthMonth: reqString,
        civilStatus: reqString,

        ageGroup: reqString,
        placeOfWork: reqString,
        residence: reqString,

        //cellGroup: reqObject,
        churchLocation: reqObject,

        email: reqEmail,
        phone: reqString
    }
)

const initialValues = {

    firstName: '',
    middleName: '',
    lastName: '',
    birthDay: '',
    birthMonth: '',
    gender: '',
    civilStatus: '',
    ageGroup: '',
    placeOfWork: '',
    residence: '',
    cellGroup: null,
    churchLocation: null,
    email: '',
    phone: '',

}

const RegisterForm = ({done}: IProps) => {
    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: ICreatePersonDto = {
            firstName: values.firstName,
            middleName: values.middleName,
            lastName: values.lastName,
            dateOfBirth: `1800-${values.birthMonth}-${values.birthDay}T00:00:00.000Z`,
            gender: values.gender,
            civilStatus: values.civilStatus,
            ageGroup: values.ageGroup,
            placeOfWork: values.placeOfWork,
            residence: values.residence,
            cellGroupId: values.cellGroup.id,
            churchLocationId: values.churchLocation.id,
            email: values.email,
            phone: values.phone
        }

        post(remoteRoutes.contactsPeople, toSave,
            (data) => {
                Toast.info('Operation successful')
                actions.resetForm()
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
        <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={initialValues}
        >
            <Grid spacing={2} container>
                <Grid item xs={12} >
                    <Box pt={2}>
                        <Typography variant='caption'>Basic Data</Typography>
                    </Box>
                    <Divider/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <XTextInput
                        name="firstName"
                        label="First Name"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <XTextInput
                        name="lastName"
                        label="Last Name"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="middleName"
                        label="Other Names"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item  xs={12} md={6}>
                    <XSelectInput
                        name="civilStatus"
                        label="Civil Status"
                        options={toOptions(civilStatusCategories)}
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box pt={1} pl={1}>
                        <XRadioInput
                            name="gender"
                            label=''
                            options={toOptions(genderCategories)}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6} >
                    <Box width='100%' display='flex'>
                        <Box width='50%'>
                            <XSelectInput
                                name="birthMonth"
                                label="Birth Month"
                                options={toOptions(getMonthsList())}
                                variant='outlined'
                                margin='none'
                            />
                        </Box>
                        <Box width='50%'>
                            <XSelectInput
                                name="birthDay"
                                label="Birth Day"
                                options={toOptions(getDayList())}
                                variant='outlined'
                                margin='none'
                            />
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <XSelectInput
                        name="ageGroup"
                        label="Age Group"
                        options={toOptions(ageCategories)}
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12} >
                    <Box pt={2}>
                        <Typography variant='caption'>Address details</Typography>
                    </Box>
                    <Divider/>
                </Grid>

                <Grid item xs={12} md={6}>
                    <XTextInput
                        name="phone"
                        label="Phone"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <XTextInput
                        name="email"
                        label="Email"
                        type="email"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <XRemoteSelect
                        remote={remoteRoutes.groupsCombo}
                        filter={{'categories[]': 'Location'}}
                        parser={({name, id}: any) => ({name: name, id: id})}
                        name="churchLocation"
                        label="Church Location"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <XRemoteSelect
                        remote={remoteRoutes.groupsCombo}
                        filter={{'categories[]': 'MC'}}
                        parser={({name, id}: any) => ({name: name, id: id})}
                        name="cellGroup"
                        label="Missional Community"
                        variant='outlined'
                        margin='none'
                        freeSolo
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <XTextInput
                        name="residence"
                        label="Residence"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <XTextInput
                        name="placeOfWork"
                        label="Place of work"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}


export default RegisterForm;
