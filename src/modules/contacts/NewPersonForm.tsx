import React from 'react';
import * as yup from "yup";
import {reqDate, reqEmail, reqObject, reqString} from "../../data/validations";
import {ageCategories, civilStatusCategories, genderCategories} from "../../data/comboCategories";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XDateInput from "../../components/inputs/XDateInput";
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
import {ICreatePersonDto} from "./types";
import {isoDateString} from "../../utils/dateHelpers";

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
        dateOfBirth: reqDate,
        civilStatus: reqString,

        ageGroup: reqString,
        placeOfWork: reqString,
        residence: reqString,

        cellGroup: reqObject,
        churchLocation: reqObject,

        email: reqEmail,
        phone: reqString
    }
)

const initialValues = {

    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
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

const NewPersonForm = ({done}: IProps) => {
    const dispatch = useDispatch();

    function handleSubmit(values: any, actions: FormikHelpers<any>) {

        const toSave: ICreatePersonDto = {

            firstName: values.firstName,
            middleName: values.middleName,
            lastName: values.lastName,
            dateOfBirth: isoDateString(values.dateOfBirth),
            gender: values.gender,
            civilStatus: values.civilStatus,

            ageGroup: values.ageGroup,
            placeOfWork: values.placeOfWork,
            residence: values.residence,

            cellGroupId: values.cellGroup.value,
            churchLocationId: values.churchLocation.value,

            email: values.email,
            phone: values.phone,

        }

        post(remoteRoutes.contactsPerson, toSave,
            (data) => {
                Toast.info('Operation successful')
                actions.resetForm()
                dispatch({
                    type: crmConstants.crmAddContact,
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
            initialValues={initialValues}
        >
            <Grid spacing={0} container>
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
                        label="Last Name"
                        type="text"
                        variant='outlined'
                    />
                </LeftPadded>
                <Grid item xs={12}>
                    <XTextInput
                        name="middleName"
                        label="Other Names"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <RightPadded >
                    <XSelectInput
                        name="civilStatus"
                        label="Civil Status"
                        options={toOptions(civilStatusCategories)}
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
                <RightPadded >
                    <XDateInput
                        name="dateOfBirth"
                        label="Date of Birth"
                        variant='outlined'
                    />
                </RightPadded>
                <LeftPadded >
                    <XSelectInput
                        name="ageGroup"
                        label="Age"
                        options={toOptions(ageCategories)}
                        variant='outlined'
                    />
                </LeftPadded>
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
                <RightPadded >
                    <XRemoteSelect
                        remote={remoteRoutes.groupsCombo}
                        filter={{'categories[]': 'Location'}}
                        parser={({name, id}: any) => ({label: name, value: id})}
                        name="churchLocation"
                        label="Church Location"
                        variant='outlined'
                    />
                </RightPadded>
                <LeftPadded >
                    <XRemoteSelect
                        remote={remoteRoutes.groupsCombo}
                        filter={{'categories[]': 'MC'}}
                        parser={({name, id}: any) => ({label: name, value: id})}
                        name="cellGroup"
                        label="Missional Community"
                        variant='outlined'
                    />
                </LeftPadded>
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
}


export default NewPersonForm;
