import * as React from 'react'
import {Field, FieldProps, getIn} from 'formik';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import {hasValue} from "./inputHelpers";

interface IProps {
    name: string
}

const XTextAreaInput = (props: TextFieldProps & IProps) => {
    const {...rest} = props
    const render = (fieldProps: FieldProps) => {
        const {field, form} = fieldProps
        const name = field.name;
        const error = getIn(form.errors, name);
        const isTouched = getIn(form.touched, name);
        const wasSubmitted = form.submitCount > 0;
        const showError = hasValue(error) && (isTouched || wasSubmitted)
        return <TextField
            fullWidth
            margin="normal"
            error={Boolean(showError)}
            {...field}
            {...props}
            value={field.value || ""}
            helperText={showError && error}
            multiline
            rowsMax="4"
            rows={4}
        />
    }
    return (
        <Field {...rest}>
            {render}
        </Field>
    )
}

export default XTextAreaInput
