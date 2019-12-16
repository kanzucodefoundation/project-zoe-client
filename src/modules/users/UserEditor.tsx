import React from 'react';
import * as yup from "yup";
import {reqString} from "../../data/validations";
import {FormikActions} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";

import {remoteRoutes} from "../../data/constants";
import {IAuthUser} from "../../data/types";
import {ISelectOpt, XRemoteSelect} from "../../components/inputs/XRemoteSelect2";
import {handleSubmission, ISubmission} from "../../utils/formHelpers";
import {IUser} from "./types";

interface IProps {
    data: IAuthUser
    isNew: boolean
    done: (dt:any) => any
}

const schema = yup.object().shape(
    {
        username: reqString,
        contactId: reqString,
        group: reqString
    }
)

const UserEditor = ({data,isNew, done}: IProps) => {

    function handleSubmit(values: any, actions: FormikActions<any>) {


        const toSave: IUser = {
            username:  values.username,
            contactId:  values.person.id,
            group:  values.userGroup.id
        }

        const submission: ISubmission = {
            url: remoteRoutes.users,
            values:toSave, actions, isNew,
            onAjaxComplete:done
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
                    <XRemoteSelect
                        name="person"
                        label="Person"
                        remote={remoteRoutes.contactsPerson}
                        parser={({id, name}: any):ISelectOpt => ({id, label: name})}
                    />
                </Grid>
                <Grid item xs={12}>
                    <XRemoteSelect
                        name="userGroup"
                        label="Group"
                        remote={remoteRoutes.userGroups}
                        parser={({id, name}: any):ISelectOpt => ({id, label: name})}
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
            </Grid>
        </XForm>
    );
}


export default UserEditor;
