import React from 'react';
import XForm from "../../components/forms/XForm";
import Grid from "@material-ui/core/Grid";
import * as yup from "yup";
import {reqArray, reqObject} from "../../data/validations";
import {top100Films} from "./testData";
import XComboInput from "../../components/inputs/XComboInput";
import {XRemoteSelect} from "../../components/inputs/XRemoteSelect";
import {parseXpath} from "../../utils/jsonHelpers";
import {IOption} from "../../components/inputs/inputHelpers";

export default {
    title: 'Combo Input',
    component: XForm,
};

export const Input = () => {
    const onSubmit = (values:any) => {
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
                        variant='standard'
                        options={top100Films.map(({title, year}) => ({name: title, id: `${year}`}))}
                    />
                    <XComboInput
                        name="movie"
                        label="Latest Movie"
                        variant='outlined'
                        options={top100Films.map(({title, year}) => ({name: title, id: `${year}`}))}
                    />
                </XForm>
            </Grid>
        </Grid>
    );
};


export const MultiInput = () => {
    const onSubmit = (values:any) => {
        alert(JSON.stringify(values, null, 2));
    }
    const schema = yup.object().shape(
        {
            movies: reqArray
        }
    )
    const initialValues = {
        movie: []
    }
    return (
        <Grid spacing={1} container>
            <Grid item xs={6}>
                <XForm
                    onSubmit={onSubmit}
                    schema={schema}
                    initialValues={initialValues}
                    debug
                >
                    <XComboInput
                        name="movie"
                        label="Latest Movie"
                        variant='standard'
                        options={top100Films.map(({title, year}) => ({name: title, id: `${year}`}))}
                        multiple
                    />
                    <XComboInput
                        name="movie"
                        label="Latest Movie"
                        variant='outlined'
                        options={top100Films.map(({title, year}) => ({name: title, id: `${year}`}))}
                        multiple
                    />
                </XForm>
            </Grid>
        </Grid>
    );
};



export const RemoteInput = () => {
    const onSubmit = (values:any) => {
        alert(JSON.stringify(values, null, 2));
    }
    const schema = yup.object().shape(
        {
            developers: reqArray,
            developer: reqObject
        }
    )
    const initialValues = {
        developers: [],
        developer: null
    }
    const url = "http://www.mocky.io/v2/5e74d15b3000004395a5f716"
    const parser = (dt:any):IOption=>{
        return {
            id:parseXpath(dt,"$.guid"),
            name:parseXpath(dt,"$.name")
        }
    }

    return (
        <Grid spacing={1} container>
            <Grid item xs={6}>
                <XForm
                    onSubmit={onSubmit}
                    schema={schema}
                    initialValues={initialValues}
                    debug
                >
                    <XRemoteSelect
                        name="developer"
                        label="Developer"
                        variant='standard'
                        remote={url}
                        parser={parser}
                    />
                    <br/>
                    <XRemoteSelect
                        name="developers"
                        label="Developers"
                        variant='outlined'
                        remote={url}
                        parser={parser}
                        multiple
                    />
                </XForm>
            </Grid>
        </Grid>
    );
};
