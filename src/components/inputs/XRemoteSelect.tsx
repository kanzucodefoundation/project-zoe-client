import React from 'react';
import {useField} from "formik";
import {hasValue, IOption} from "./inputHelpers";
import {PRemoteSelect} from "../plain-inputs/PRemoteSelect";

export interface IXRemoteProps {
    name: string
    label: string
    remote: string
    filter?: any
    parser: (d: any) => IOption
    variant?: 'outlined' | 'filled' | 'standard'
    multiple?: any
    size?: 'small' | 'medium';
    searchOnline?: boolean
    defaultOptions?: IOption[]
}

export const XRemoteSelect = (props: IXRemoteProps) => {
    const [field, meta, helpers] = useField({name: props.name});
    const error = hasValue(meta.error) ? meta.error : undefined
    const showError = Boolean(error && meta.touched)

    function handleTouch() {
        helpers.setTouched(true)
    }

    function handleChange(value: IOption) {
        helpers.setValue(value)
    }

    return <PRemoteSelect
        {...props}
        value={field.value}
        onChange={handleChange}
        onBlur={handleTouch}
        error={Boolean(showError)}
        helperText={showError && error}
    />
}
