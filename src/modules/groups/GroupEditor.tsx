import React from 'react';
import * as yup from "yup";
import {reqObject, reqString} from "../../data/validations";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import {remoteRoutes} from "../../data/constants";
import {GroupPrivacy, IGroup} from "./types";
import XSelectInput from "../../components/inputs/XSelectInput";
import {toOptions} from "../../components/inputs/inputHelpers";
import {enumToArray} from "../../utils/stringHelpers";
import {XRemoteSelect} from "../../components/inputs/XRemoteSelect";
import {handleSubmission, ISubmission} from "../../utils/formHelpers";

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
        category: reqObject
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
        const toSave: any = {
            id: values.id,
            name: values.name,
            details: values.details,
            privacy: values.privacy,
            categoryId: values.category.id,
            parentId: values.parent?.id
        }

        const submission: ISubmission = {
            url: remoteRoutes.groups,
            values: toSave, actions, isNew,
            onAjaxComplete: (data: any) => {
                if (isNew) {
                    onGroupAdded && onGroupAdded(data)
                } else {
                    onGroupEdited && onGroupEdited(data)
                }
                actions.resetForm()
                actions.setSubmitting(false);
            }
        }
        handleSubmission(submission)
    }

    return (
        <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={{...initialData, ...data}}
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
