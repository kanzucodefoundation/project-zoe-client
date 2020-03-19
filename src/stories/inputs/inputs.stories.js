import React from 'react';
import XForm from "../../components/forms/XForm";
import Grid from "@material-ui/core/Grid";
import XTextInput from "../../components/inputs/XTextInput";
import {Box} from "@material-ui/core";
import XRadioInput from "../../components/inputs/XRadioInput";
import {toOptions} from "../../components/inputs/inputHelpers";
import {ageCategories, genderCategories} from "../../data/comboCategories";
import XDateInput from "../../components/inputs/XDateInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import {XRemoteSelect} from "../../components/inputs/XRemoteSelect";
import {remoteRoutes} from "../../data/constants";
import * as yup from "yup";
import {reqDate, reqEmail, reqString} from "../../data/validations";

export default {
    title: 'FormInputs',
    component: XForm,
};

export const PersonForm = () => {
    const onSubmit = (values) => {
        alert(JSON.stringify(values, null, 2));
    }
    const schema = yup.object().shape(
        {
            firstName: reqString,
            lastName: reqString,
            gender: reqString,
            dateOfBirth: reqDate,
            email: reqEmail,
            phone: reqString,
        }
    )
    const data = {
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        email: "",
        phone: "",
    }
    return (
        <XForm
            onSubmit={onSubmit}
            schema={schema}
            initialValues={data}
            debug
        >
            <Grid spacing={1} container>
                <Grid item xs={6}>
                    <XTextInput
                        name="firstName"
                        label="First Name"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XTextInput
                        name="lastName"
                        label="Last Name"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XTextInput
                        name="middleName"
                        label="Other Names"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <Box pt={3}>
                        <XRadioInput
                            name="gender"
                            label="Gender"
                            options={toOptions(genderCategories)}
                        />
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <XDateInput
                        name="dateOfBirth"
                        label="Date of Birth"
                        inputVariant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XSelectInput
                        name="ageGroup"
                        label="Age"
                        options={toOptions(ageCategories)}
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="phone"
                        label="Phone"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="email"
                        label="Email"
                        type="email"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XRemoteSelect
                        remote={remoteRoutes.groupsLocationCombo}
                        filter={{category: 'Location'}}
                        parser={({name, id}) => ({label: name, id})}
                        name="churchLocation"
                        label="Church Location"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XRemoteSelect
                        remote={remoteRoutes.groupsLocationCombo}
                        filter={{category: 'MC'}}
                        parser={({name, id}) => ({label: name, id})}
                        name="cellGroup"
                        label="Missional Community"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="placeOfWork"
                        label="Place of work"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="residence"
                        label="Residence"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
};
