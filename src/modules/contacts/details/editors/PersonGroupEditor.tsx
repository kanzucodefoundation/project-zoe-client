import React from 'react';
import * as yup from "yup";
import {reqString} from "../../../../data/validations";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../../components/forms/XForm";

import {remoteRoutes} from "../../../../data/constants";
import {post, put} from "../../../../utils/ajax";
import Toast from "../../../../utils/Toast";
import {GroupRole, IGroup} from "../../../groups/types";
import XSelectInput from "../../../../components/inputs/XSelectInput";
import {toOptions} from "../../../../components/inputs/inputHelpers";
import {enumToArray} from "../../../../utils/stringHelpers";

interface IProps {
    data?: Partial<IGroup>
    isNew: boolean
    onGroupAdded?: (g: any) => any
    onGroupEdited?: (g: any) => any
}

const schema = yup.object().shape(
    {
        name: reqString,
        description: reqString,
        tag: reqString
    }
)

const GroupEditor = ({data, isNew, onGroupAdded, onGroupEdited}: IProps) => {

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: IGroup = {
            ...data,
            name: values.name,
            description: values.description,
            privacy: values.privacy,
            tag: values.tag,
            parent: values.parent
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
            initialValues={data}
        >
            <Grid spacing={1} container>
                <Grid item xs={12}>
                    {/*<XRemoteSelect*/}
                    {/*    name="group"*/}
                    {/*    label="Group"*/}
                    {/*    type="text"*/}
                    {/*    variant='outlined'*/}
                    {/*    remote={remoteRoutes.groups}*/}
                    {/*/>*/}
                </Grid>
                <Grid item xs={12}>
                    <XSelectInput
                        name="role"
                        label="Role"
                        options={toOptions(enumToArray(GroupRole))}
                        variant='outlined'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}

export default GroupEditor;
