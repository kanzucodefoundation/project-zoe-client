import React from 'react';
import XForm from "../../components/forms/XForm";
import Grid from "@material-ui/core/Grid";
import * as yup from "yup";
import {reqDate, reqString} from "../../data/validations";
import {top100Films} from "./testData";
import XComboInput from "../../components/inputs/XComboInput";
import XDateInput from "../../components/inputs/XDateInput";

export default {
    title: 'Date Input',
    component: XForm,
};

export const Input = () => {
    const onSubmit = (values) => {
        alert(JSON.stringify(values, null, 2));
    }
    const schema = yup.object().shape(
        {
            movie: reqDate
        }
    )
    const data = {
        movie: ""
    }
    return (
        <XForm
            onSubmit={onSubmit}
            schema={schema}
            initialValues={data}
            debug
        >
            <Grid spacing={1} container>
                <Grid item xs={6}>
                    <XDateInput
                        name="movie"
                        label="Latest Movie"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
};
