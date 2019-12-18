import React from 'react';
import * as yup from "yup";
import {reqString} from "../../../data/validations";
import {FormikActions} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../components/forms/XForm";
import XTextInput from "../../../components/inputs/XTextInput";

import {appRoles, remoteRoutes} from "../../../data/constants";
import {handleSubmission, ISubmission} from "../../../utils/formHelpers";
import XSelectInput from "../../../components/inputs/XSelectInput";
import {toOptions} from "../../../components/inputs/inputHelpers";

interface IProps {
    data: any
    isNew: boolean
    done: (dt: any) => any
}


const schema = yup.object().shape(
    {
        name: reqString,
        details: reqString,
        roles: yup.array().required()
    }
)

const UserGroupEditor = ({data, isNew, done}: IProps) => {

    function handleSubmit(values: any, actions: FormikActions<any>) {
        const toSave: any = {
            id: values.id,
            name: values.name,
            details: values.details,
            roles: values.roles
        }
        const submission: ISubmission = {
            url: remoteRoutes.userGroups,
            values: toSave, actions, isNew,
            onAjaxComplete: done
        }
        handleSubmission(submission)
    }

    return (
        <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={data}
        >
            <Grid spacing={1} container>
                <Grid item xs={12}>
                    <XSelectInput
                        name="roles"
                        label="Roles"
                        options={toOptions(Object.values(appRoles))}
                        variant='outlined'
                        multiple
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="name"
                        label="Name"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="details"
                        label="Details"
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


export default UserGroupEditor;
