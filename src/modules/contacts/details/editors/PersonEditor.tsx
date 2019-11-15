import React from 'react';
import * as yup from "yup";
import {reqDate, reqString} from "../../../../data/validations";
import {civilStatusCategories, genderCategories, salutationCategories} from "../../../../data/comboCategories";
import {FormikActions} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../../components/forms/XForm";
import XTextInput from "../../../../components/inputs/XTextInput";
import XDateInput from "../../../../components/inputs/XDateInput";
import {toOptions} from "../../../../components/inputs/inputHelpers";

import {remoteRoutes} from "../../../../data/constants";
import {useDispatch} from 'react-redux'
import {crmConstants} from "../../../../data/contacts/reducer";
import {put} from "../../../../utils/ajax";
import Toast from "../../../../utils/Toast";
import XRadioInput from "../../../../components/inputs/XRadioInput";
import {IPerson} from "../../types";
import XSelectInput from "../../../../components/inputs/XSelectInput";

interface IProps {
    data: IPerson
    contactId: string
    done?: () => any
}

const schema = yup.object().shape(
    {
        firstName: reqString,
        lastName: reqString,
        gender: reqString,
        dateOfBirth: reqDate
    }
)

const PersonEditor = ({data, done,contactId}: IProps) => {
    const dispatch = useDispatch();

    function handleSubmit(values: any, actions: FormikActions<any>) {
        const toSave: IPerson = {
            firstName: values.firstName,
            middleName: values.middleName,
            lastName: values.lastName,
            dateOfBirth: values.dateOfBirth,
            gender: values.gender,
            salutation: values.salutation,
            civilStatus: values.civilStatus,
            about: values.about,
            avatar: ""
        }
        put(`${remoteRoutes.contactsPerson}/${contactId}`, toSave,
            (data) => {
                Toast.info('Operation successful')
                actions.resetForm()
                dispatch({
                    type: crmConstants.crmEditPerson,
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
        <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={data}
        >
            <Grid spacing={1} container>
                <Grid item xs={4}>
                    <XSelectInput
                        name="salutation"
                        label="Title"
                        options={toOptions(salutationCategories)}
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={8}>
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
                <Grid item xs={12}>
                    <XRadioInput
                        name="gender"
                        label="Gender"
                        options={toOptions(genderCategories)}
                    />
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
                        name="civilStatus"
                        label="Civil Status"
                        options={toOptions(civilStatusCategories)}
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="about"
                        label="About"
                        variant='outlined'
                        multiline
                        rowsMax="4"
                        rows={4}
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}


export default PersonEditor;
