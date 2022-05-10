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
import StoryLayout from "../story.layout";
import NewPersonForm from "../../modules/contacts/NewPersonForm";

export default {
    title: 'FormInputs',
    component: XForm,
};

export const PersonForm = () => {
    const onSubmit = (values: any) => {
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
        <StoryLayout>
            <NewPersonForm data={data}/>
        </StoryLayout>
    );
};
