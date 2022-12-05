import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { dateFormat } from '../../utils/dateHelpers';

interface IProps {
  onChange: (date: Date | null) => any;
  value: Date | null;
  shouldDisableDate?:any;
  label?: string;
  name?: string;
  variant?: 'inline';
  inputVariant?: 'standard' | 'outlined' | 'filled';
}

const disableDates = (date:any):boolean => {
  let disabledDays = date.getDay() === 1 || date.getDay() === 2 || date.getDay() === 3 || date.getDay() === 4 || date.getDay() === 5;
  return disabledDays;
}

export default function PDateInputRange({
  value = null,
  onChange,
  variant,
  label,
  inputVariant,
}: IProps) {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        fullWidth
        disableToolbar
        inputVariant={inputVariant}
        size="small"
        variant={variant}
        format={dateFormat}
        label={label}
        value={value}
        shouldDisableDate={disableDates}
        onChange={onChange}
        autoComplete="off"
        KeyboardButtonProps={{
          'aria-label': 'change date',
        }}
      />
    </MuiPickersUtilsProvider>
  );
}
