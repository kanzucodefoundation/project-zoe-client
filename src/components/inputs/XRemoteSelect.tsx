import React from 'react';
import {useField} from "formik";
import {hasValue} from "./inputHelpers";
import {IPRemoteProps, PRemoteSelect} from "../plain-inputs/PRemoteSelect";
import {ComboValue} from "../plain-inputs/PComboInput";

type XRemoteProps = Omit<IPRemoteProps, 'onChange'|'value'|'onBlur'|'helperText'|'showError'>

export const XRemoteSelect = (props: XRemoteProps) => {
    const [field, meta, helpers] = useField({name: props.name});
    const error = hasValue(meta.error) ? meta.error : undefined
    const showError = Boolean(error && meta.touched)

    function handleTouch() {
        helpers.setTouched(true)
    }

    function handleChange(value: ComboValue) {
        helpers.setValue(value)
    }

    return <PRemoteSelect
        {...props}
        value={field.value}
        onChange={handleChange}
        onBlur={handleTouch}
        showError={Boolean(showError)}
        helperText={showError ? error:undefined}
    />
}
