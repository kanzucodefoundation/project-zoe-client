import React, { useState } from "react";
import * as yup from "yup";
import { reqString } from "../../../data/validations";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../components/forms/XForm";
import { remoteRoutes } from "../../../data/constants";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import { del } from "../../../utils/ajax";
import Toast from "../../../utils/Toast";
import XComboInput from "../../../components/inputs/XComboInput";
import { cleanComboValue } from "../../../utils/dataHelpers";
import { enumToArray } from "../../../utils/stringHelpers";
import { GroupRole } from "../types";

interface IProps {
  data: any;
  done: (dt: any) => any;
  onDeleted: (dt: any) => any;
  onCancel?: () => any;
}

const schema = yup.object().shape(
    {
        role: reqString
    }
)

const MemberEditor = ({data, done, onDeleted, onCancel}: IProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: any = {
            ...values,
            role: cleanComboValue(values.role)
        }
        const submission: ISubmission = {
            url: remoteRoutes.groupsMembership,
            values: toSave, actions, isNew:false,
            onAjaxComplete: done
        }
        handleSubmission(submission)
    }

    function handleDelete() {
        setLoading(true)
        del(
            `${remoteRoutes.groupsMembership}/${data.id}`,
            dt => {
                Toast.success("Operation succeeded")
                onDeleted(data)
            },
            undefined,
            () => {
                setLoading(false)
            })
    }

    return (
        <XForm
            onSubmit={handleSubmit}
            schema={ schema }
            initialValues={data}
            onDelete={handleDelete}
            loading={loading}
            onCancel={onCancel}
        >
            <Grid spacing={1} container>
                <Grid item xs={12}>
                    <XComboInput
                        name="role"
                        label="Role"
                        options={enumToArray(GroupRole)}
                        variant='outlined'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}

export default MemberEditor;
