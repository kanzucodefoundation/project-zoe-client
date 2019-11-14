import React from 'react';
import * as yup from "yup";
import {reqDate, reqString} from "../../../../data/validations";
import {idCategories} from "../../../../data/comboCategories";
import {FormikActions} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../../components/forms/XForm";
import XTextInput from "../../../../components/inputs/XTextInput";
import XDateInput from "../../../../components/inputs/XDateInput";
import XSelectInput from "../../../../components/inputs/XSelectInput";
import {toOptions} from "../../../../components/inputs/inputHelpers";
import XCheckBoxInput from "../../../../components/inputs/XCheckBoxInput";
import {IIdentification} from "../../types";
import {remoteRoutes} from "../../../../data/constants";
import {useDispatch} from 'react-redux'
import {crmConstants} from "../../../../data/contacts/reducer";
import {handleSubmission, ISubmission} from "../../../../utils/formHelpers";

interface IProps {
    contactId: string
    data: IIdentification | null
    isNew: boolean
    done?: () => any
}

const schema = yup.object().shape(
    {
        category: reqString.oneOf(idCategories),
        value: reqString,
        issuingCountry: reqString,
        startDate: reqDate,
        expiryDate: reqDate
    }
)

const IdentificationEditor = ({data, isNew, contactId, done}: IProps) => {
    const dispatch = useDispatch();

    function handleSubmit(values: any, actions: FormikActions<any>) {
        const submission: ISubmission = {
            url: `${remoteRoutes.contactsIdentification}/${contactId}`,
            values, actions, isNew,
            onAjaxComplete: (data: any) => {
                dispatch({
                    type: isNew ? crmConstants.crmAddIdentification : crmConstants.crmEditIdentification,
                    payload: {...data},
                })
                if (done)
                    done()
            }
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
                        name="category"
                        label="Category"
                        options={toOptions(idCategories)}
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="value"
                        label="Id Number"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="issuingCountry"
                        label="Issuing Country"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XDateInput
                        name="startDate"
                        label="Issue Date"
                        inputVariant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XDateInput
                        name="expiryDate"
                        label="Expiry Date"
                        inputVariant='outlined'
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


export default IdentificationEditor;
