import * as React from 'react'
import {Field, FieldProps, getIn} from 'formik';
import TextField, {TextFieldProps} from '@material-ui/core/TextField';
import {hasValue} from "./inputHelpers";

interface IProps {
    name: string
}

const XTextInput = (props: TextFieldProps & IProps) => {
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
            helperText={showError && error}
            {...field}
            {...props}
            value={field.value || ""}

        />
    }
    return (
        <Field {...rest}>
            {render}
        </Field>
    )
}

export default XTextInput
