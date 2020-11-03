import React from 'react';
import * as yup from "yup";
import {reqDate, reqObject, reqString} from "../../../../data/validations";
import {
    ageCategories,
    civilStatusCategories,
    genderCategories,
    salutationCategories
} from "../../../../data/comboCategories";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../../components/forms/XForm";
import XTextInput from "../../../../components/inputs/XTextInput";
import {toOptions} from "../../../../components/inputs/inputHelpers";

import {remoteRoutes} from "../../../../data/constants";
import {useDispatch} from 'react-redux'
import {crmConstants} from "../../../../data/contacts/reducer";
import {put} from "../../../../utils/ajax";
import Toast from "../../../../utils/Toast";
import XRadioInput from "../../../../components/inputs/XRadioInput";
import {IPerson} from "../../types";
import XSelectInput from "../../../../components/inputs/XSelectInput";
import {getDayList, getMonthsList} from "../../../../utils/dateHelpers";
import {parseISO} from "date-fns";

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
        dateOfBirth: reqDate,

        birthDay: reqString,
        birthMonth: reqString,
        civilStatus: reqString,

        ageGroup: reqString
    }
)

const PersonEditor = ({data, done}: IProps) => {
    const dispatch = useDispatch();

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: any = {
            ...data,
            salutation: values.salutation,
            firstName: values.firstName,
            middleName: values.middleName,
            lastName: values.lastName,
            gender: values.gender,

            civilStatus: values.civilStatus,
            dateOfBirth: `1800-${values.birthMonth}-${values.birthDay}T00:00:00.000Z`,
            ageGroup: values.ageGroup,

            placeOfWork: values.placeOfWork,
            residence: values.residence,
        }
        put(remoteRoutes.contactsPeople, toSave,
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

    const {dateOfBirth} = data;
    const initialData: any = {...data, birthDay: '', birthMonth: ''}
    try {
        const dt: Date = parseISO(`${dateOfBirth}`)
        initialData['birthDay'] = `${dt.getDay()}`.padStart(2,'0')
        initialData['birthMonth'] = `${dt.getMonth()}`.padStart(2,'0')
    } catch (e) {
        console.log("invalid date")
    }
    return (
        <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={initialData}
            onCancel={done}
        >
            <Grid spacing={3} container>
                <Grid item xs={4}>
                    <XSelectInput
                        name="salutation"
                        label="Title"
                        options={toOptions(salutationCategories)}
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={8}>
                    <XTextInput
                        name="firstName"
                        label="First Name"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XTextInput
                        name="lastName"
                        label="Last Name"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XTextInput
                        name="middleName"
                        label="Other Names"
                        type="text"
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XRadioInput
                        name="gender"
                        label="Gender"
                        options={toOptions(genderCategories)}
                    />
                </Grid>
                <Grid item xs={6}>
                    <XSelectInput
                        name="civilStatus"
                        label="Civil Status"
                        options={toOptions(civilStatusCategories)}
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <XSelectInput
                        name="ageGroup"
                        label="Age Group"
                        options={toOptions(ageCategories)}
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={6} md={4}>
                    <XSelectInput
                        name="birthMonth"
                        label="Birth Month"
                        options={toOptions(getMonthsList())}
                        variant='outlined'
                        margin='none'
                    />
                </Grid>
                <Grid item xs={6} md={4}>
                    <XSelectInput
                        name="birthDay"
                        label="Birth Day"
                        options={toOptions(getDayList())}
                        variant='outlined'
                        margin='none'
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
                <Grid item xs={12}>
                    <XTextInput
                        name="about"
                        label="About"
                        variant='outlined'
                        placeholder='Tell us about yourself'
                        multiline
                        rowsMax="4"
                        rows={4}
                        margin='none'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}


export default PersonEditor;
