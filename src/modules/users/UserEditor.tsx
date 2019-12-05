import React from 'react';
import * as yup from "yup";
import {reqString} from "../../data/validations";
import {FormikActions} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";

import {remoteRoutes} from "../../data/constants";
import {useDispatch} from 'react-redux'
import {crmConstants} from "../../data/contacts/reducer";
import {put} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import {IPerson} from "../contacts/types";
import {IUser} from "../../data/types";

interface IProps {
    data: IUser
    contactId: string
    done?: () => any
}

const schema = yup.object().shape(
    {
        username: reqString,
        contactId: reqString,
        role: reqString
    }
)

const UserEditor = ({data, done,contactId}: IProps) => {
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
                <Grid item xs={8}>
                    <XTextInput
                        name="username"
                        label="Username"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XTextInput
                        name="role"
                        label="Role"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}


export default UserEditor;
