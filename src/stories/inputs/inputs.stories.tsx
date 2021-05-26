import React from "react";
import XForm from "../../components/forms/XForm";
import * as yup from "yup";
import { reqDate, reqEmail, reqString } from "../../data/validations";
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
