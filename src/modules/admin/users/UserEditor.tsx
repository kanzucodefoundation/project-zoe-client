import React from 'react';
import * as yup from "yup";
import {reqString} from "../../../data/validations";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../components/forms/XForm";
import XTextInput from "../../../components/inputs/XTextInput";

import {remoteRoutes} from "../../../data/constants";
import {XRemoteSelect} from "../../../components/inputs/XRemoteSelect";
import {handleSubmission, ISubmission} from "../../../utils/formHelpers";
import {IOption} from "../../../components/inputs/inputHelpers";

interface IProps {
    data: any
    isNew: boolean
    done: (dt: any) => any
}

const schema = yup.object().shape(
    {
        username: reqString,
        contact: yup.object().required(),
        group: yup.object().required()
    }
)

const schemaNew = yup.object().shape(
    {
        password: reqString,
        username: reqString,
        contact: yup.object().required(),
        group: yup.object().required()
    }
)

const UserEditor = ({data, isNew, done}: IProps) => {

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: any = {
            id: values.id,
            username: values.username,
            contact: values.contact.id,
            group: values.group.id,
            password: values.password
        }
        const submission: ISubmission = {
            url: remoteRoutes.users,
            values: toSave, actions, isNew,
            onAjaxComplete: done
        }
        handleSubmission(submission)
    }

    return (
        <XForm
            onSubmit={handleSubmit}
            schema={isNew ? schemaNew : schema}
            initialValues={data}
        >
            <Grid spacing={1} container>
                <Grid item xs={12}>
                    <XRemoteSelect
                        name="contact"
                        label="Person"
                        remote={remoteRoutes.contactsPerson}
                        parser={({id, name}: any): IOption => ({value: id, label: name})}
                    />
                </Grid>
                <Grid item xs={12}>
                    <XRemoteSelect
                        name="group"
                        label="Group"
                        remote={remoteRoutes.userGroups}
                        parser={({id, name}: any): IOption => ({value: id, label: name})}
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="username"
                        label="Username"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="password"
                        label="Password"
                        type="password"
                        variant='outlined'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}


export default UserEditor;
