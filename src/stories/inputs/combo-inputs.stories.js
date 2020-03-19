import React from 'react';
import XForm from "../../components/forms/XForm";
import Grid from "@material-ui/core/Grid";
import * as yup from "yup";
import {reqObject} from "../../data/validations";
import {top100Films} from "./testData";
import XComboInput from "../../components/inputs/XComboInput";
import XMultiComboInput from "../../components/inputs/XMultiComboInput";

export default {
    title: 'Combo Input',
    component: XForm,
};

export const Input = () => {
    const onSubmit = (values) => {
        alert(JSON.stringify(values, null, 2));
    }
    const schema = yup.object().shape(
        {
            movie: reqObject
        }
    )
    const data = {
        movie: ""
    }
    return (
        <Grid spacing={1} container>
            <Grid item xs={6}>
                <XForm
                    onSubmit={onSubmit}
                    schema={schema}
                    initialValues={data}
                    debug
                >

                    <XComboInput
                        name="movie"
                        label="Latest Movie"
                        type="text"
                        variant='outlined'
                        options={top100Films.map(({title, year}) => ({label: title, value: `${year}`}))}
                    />

                    <XComboInput
                        name="movies"
                        label="Latest Movies"
                        type="text"
                        variant='outlined'
                        multiple
                        options={top100Films.map(({title, year}) => ({label: title, value: `${year}`}))}
                    />

                </XForm>
            </Grid>
        </Grid>
    );
};


export const MultiInput = () => {
    const onSubmit = (values) => {
        alert(JSON.stringify(values, null, 2));
    }
    const schema = yup.object().shape(
        {
            movie: reqObject
        }
    )
    const data = {
        movie: ""
    }
    return (
        <Grid spacing={1} container>
            <Grid item xs={6}>
                <XForm
                    onSubmit={onSubmit}
                    schema={schema}
                    initialValues={data}
                    debug
                >

                    <XMultiComboInput
                        name="movie"
                        label="Latest Movie"
                        type="text"
                        variant='outlined'
                        options={top100Films.map(({title, year}) => ({label: title, value: `${year}`}))}
                    />
                </XForm>
            </Grid>
        </Grid>
    );
};
