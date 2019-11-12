import React from "react";
import {Field} from 'formik';
import {CheckboxWithLabel} from 'formik-material-ui';

interface IProps {
    name: string
    label: string
}

const XCheckBoxInput = (props: IProps) => {
    return <Field
        {...props}
        Label={{label: props.label}}
        component={CheckboxWithLabel}
    />
}

export default XCheckBoxInput
