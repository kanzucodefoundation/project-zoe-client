import React from "react";
import {useField} from 'formik';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, MuiPickersUtilsProvider,} from '@material-ui/pickers'
import {hasValue} from "./inputHelpers";
import {dateFormat} from "../../utils/dateHelpers";
import {KeyboardDatePickerProps} from "@material-ui/pickers/DatePicker/DatePicker";
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date";

interface IProps {
    name: string
    variant?: 'outlined' | 'filled' | 'standard'
    pickerVariant?: 'inline' | 'dialog' | 'static'
}

const XDateInput = (props: IProps & Partial<KeyboardDatePickerProps>) => {
    const [field, meta, helpers] = useField({name: props.name});
    const error = hasValue(meta.error) ? meta.error : undefined
    const showError = Boolean(error && meta.touched)

    function handleChange(date: MaterialUiPickersDate) {
        return helpers.setValue(date?.toLocaleString())
    }

    return <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
            {...props}
            fullWidth
            variant={props.pickerVariant}
            margin="normal"
            format={dateFormat}
            autoOk
            name={field.name}
            value={field.value || null}
            helperText={showError && error}
            error={Boolean(showError)}
            onChange={handleChange}
            onBlur={() => helpers.setTouched(true)}
            inputVariant={props.variant}
        />
    </MuiPickersUtilsProvider>
}

export default XDateInput
