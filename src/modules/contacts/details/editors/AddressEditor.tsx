import React from 'react';
import * as yup from "yup";
import {reqString} from "../../../../data/validations";
import {addressCategories} from "../../../../data/comboCategories";
import {FormikActions} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../../components/forms/XForm";
import XTextInput from "../../../../components/inputs/XTextInput";
import XSelectInput from "../../../../components/inputs/XSelectInput";
import {toOptions} from "../../../../components/inputs/inputHelpers";
import XCheckBoxInput from "../../../../components/inputs/XCheckBoxInput";
import {IAddress} from "../../types";
import {remoteRoutes} from "../../../../data/constants";
import {useDispatch} from 'react-redux'
import {crmConstants} from "../../../../data/contacts/reducer";
import {handleSubmission, ISubmission} from "../../../../utils/formHelpers";

interface IProps {
    contactId: string
    data: IAddress | null
    isNew: boolean
    done?: () => any
}

const schema = yup.object().shape(
    {
        category: reqString.oneOf(addressCategories),
        country: reqString,
        district: reqString,
        county: reqString,
        subCounty: reqString,
    }
)

const AddressEditor = ({data, isNew, contactId, done}: IProps) => {
    const dispatch = useDispatch();

    function handleSubmit(values: any, actions: FormikActions<any>) {
        const submission: ISubmission = {
            url: `${remoteRoutes.contactsAddress}/${contactId}`,
            values, actions, isNew,
            onAjaxComplete: (data: any) => {
                dispatch({
                    type: isNew ? crmConstants.crmAddAddress : crmConstants.crmEditAddress,
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
            <Grid spacing={0} container>
                <Grid item xs={12}>
                    <XSelectInput
                        name="category"
                        label="Category"
                        options={toOptions(addressCategories)}
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="country"
                        label="Country"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="district"
                        label="District"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="county"
                        label="County"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="subCounty"
                        label="Sub County"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="village"
                        label="Village"
                        type="text"
                        variant='outlined'
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

export default AddressEditor;
