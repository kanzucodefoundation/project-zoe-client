import * as React from "react";
import { useField } from "formik";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import { hasValue } from "./inputHelpers";

interface IProps {
  name: string;
}

const XTextAreaInput = ({name,margin = 'normal', ...props}: TextFieldProps & IProps) => {
    const [field, meta] = useField({name});
    const error = hasValue(meta.error) ? meta.error : undefined
    const showError = Boolean(error && meta.touched)
    return (
        <TextField
            {...field}
            {...props}
            fullWidth
            error={showError}
            helperText={showError && error}
            value={field.value || ""}
            margin={margin}
            multiline
            rowsMax="4"
            rows={4}
            autoComplete="off"
        />
    )
}

export default XTextAreaInput
