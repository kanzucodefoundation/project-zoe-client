import React from "react";
import * as yup from "yup";
import { reqEmail, reqString } from "../../../../data/validations";
import { emailCategories } from "../../../../data/comboCategories";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../../components/forms/XForm";
import XTextInput from "../../../../components/inputs/XTextInput";
import XSelectInput from "../../../../components/inputs/XSelectInput";
import { toOptions } from "../../../../components/inputs/inputHelpers";
import XCheckBoxInput from "../../../../components/inputs/XCheckBoxInput";
import { IEmail } from "../../types";
import { remoteRoutes } from "../../../../data/constants";
import { useDispatch } from "react-redux";
import { crmConstants } from "../../../../data/contacts/reducer";
import { handleSubmission, ISubmission } from "../../../../utils/formHelpers";
import { useDelete } from "../../../../data/hooks/useDelete";

interface IProps {
    contactId: string
    data: IEmail | null
    isNew: boolean
    done?: () => any
}

const schema = yup.object().shape(
    {
        value: reqEmail,
        category: reqString.oneOf(emailCategories)
    }
)

const EmailEditor = ({data, isNew, contactId, done}: IProps) => {
    const dispatch = useDispatch();

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const submission: ISubmission = {
            url: remoteRoutes.contactsEmail,
            values:{...values,contactId}, actions, isNew,
            onAjaxComplete: (data: any) => {
                dispatch({
                    type: isNew ? crmConstants.crmAddEmail : crmConstants.crmEditEmail,
                    payload: {...data},
                })
                if (done)
                    done()
            }
        }
        handleSubmission(submission)
    }

    const deleteActions = useDelete({
        url: `${remoteRoutes.contactsEmail}/${data?.id}`,
        onDone: done,
        id: data?.id!,
        action: crmConstants.crmDeleteEmail
    })

    return (
        <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={data}
            onCancel={done}
            onDelete={deleteActions.handleDelete}
            loading={deleteActions.loading}
        >
            <Grid spacing={0} container>
                <Grid item xs={12}>
                    <XSelectInput
                        name="category"
                        label="Category"
                        options={toOptions(emailCategories)}
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="value"
                        label="Email"
                        type="email"
                        variant='outlined'
                        aria-label='phone'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XCheckBoxInput
                        name="isPrimary"
                        label="Primary/Default"
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}


export default EmailEditor;
