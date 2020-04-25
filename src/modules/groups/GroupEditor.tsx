import React from 'react';
import * as yup from "yup";
import {reqObject, reqString} from "../../data/validations";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";

import {remoteRoutes} from "../../data/constants";
import {post, put} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import {GroupPrivacy, IGroup} from "./types";
import XSelectInput from "../../components/inputs/XSelectInput";
import {toOptions} from "../../components/inputs/inputHelpers";
import {enumToArray} from "../../utils/stringHelpers";
import {XRemoteSelect} from "../../components/inputs/XRemoteSelect";

interface IProps {
    data?: Partial<IGroup>
    isNew: boolean
    onGroupAdded?: (g: any) => any
    onGroupEdited?: (g: any) => any
}

const schema = yup.object().shape(
    {
        name: reqString,
        privacy: reqString,
        details: reqString,
        category: reqObject,
        parent: reqObject
    }
)

const initialData = {
    name: '',
    privacy: '',
    details: '',
    category: null,
    parent: null
}

const GroupEditor = ({data, isNew, onGroupAdded, onGroupEdited}: IProps) => {
    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: IGroup = {
            id: 0,
            ...data,
            name: values.name,
            details: values.details,
            privacy: values.privacy,
            categoryId: values.category.id,
            parentId: values.parent.id
        }
        if (isNew) {
            post(remoteRoutes.groups, toSave,
                (data) => {
                    Toast.info('Group created')
                    actions.resetForm()
                    onGroupAdded && onGroupAdded(data)
                },
                undefined,
                () => {
                    actions.setSubmitting(false);
                }
            )
        } else {
            put(remoteRoutes.groups, toSave,
                (data) => {
                    Toast.info('Group updated')
                    actions.resetForm()
                    onGroupEdited && onGroupEdited(data)
                },
                undefined,
                () => {
                    actions.setSubmitting(false);
                }
            )
        }
    }

    return (
        <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={{...initialData, ...data}}
            debug
        >
            <Grid spacing={1} container>
                <Grid item xs={4}>
                    <XSelectInput
                        name="privacy"
                        label="Privacy"
                        options={toOptions(enumToArray(GroupPrivacy))}
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={8}>
                    <XRemoteSelect
                        remote={remoteRoutes.groupsCategories}
                        parser={({name, id}: any) => ({name, id})}
                        name="category"
                        label="category"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XRemoteSelect
                        remote={remoteRoutes.groupsCombo}
                        parser={({name, id}: any) => ({name, id})}
                        name="parent"
                        label="Parent Group"
                        variant='outlined'
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
                        rowsMax="3"
                        rows={3}
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}

export default GroupEditor;
