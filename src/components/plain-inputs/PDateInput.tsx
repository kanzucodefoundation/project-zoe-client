import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, MuiPickersUtilsProvider,} from '@material-ui/pickers';
import {dateFormat} from "../../utils/dateHelpers";


interface IProps {
    onChange:(date: Date | null) => any
    value:Date | null
    label?:string
    name?:string
    variant?:"inline"
    inputVariant?: 'standard' | 'outlined' | 'filled'
}

export default function PDateInput({value=null,onChange,variant,label,inputVariant}:IProps) {
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
                fullWidth
                disableToolbar
                inputVariant={inputVariant}
                size='small'
                variant={variant}
                format={dateFormat}
                id="date-picker-inline"
                label={label}
                value={value}
                onChange={onChange}
                autoComplete='off'
                KeyboardButtonProps={{
                    'aria-label': 'change date',
                }}
            />
        </MuiPickersUtilsProvider>
    );
}
