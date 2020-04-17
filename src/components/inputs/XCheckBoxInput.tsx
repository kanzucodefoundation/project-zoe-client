import React from "react";
import {useField} from 'formik';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

interface IProps {
    name: string
    label: string
}

const XCheckBoxInput = (props: IProps) => {
    const [field] = useField({name: props.name});
    return <FormControlLabel
        label={props.label}
        control={
            <Checkbox
                checked={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={props.name}
                color="primary"
            />
        }
    />
}
export default XCheckBoxInput
