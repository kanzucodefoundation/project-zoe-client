import * as React from 'react'
import {Field, FieldProps, getIn,} from 'formik';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import {hasValue} from "./inputHelpers";


interface IOption {
    label: string
    value: string
}

interface IProps {
    label: string
    name: string
    options: IOption[]
}

const XRadioInput = (props: IProps) => {
    const {label = '', options = [], ...rest} = props
    const render = (fieldProps: FieldProps) => {
        const {field, form} = fieldProps
        const name = field.name;
        const value = field.value;
        const error = getIn(form.errors, name);
        const isTouched = getIn(form.touched, name);
        const wasSubmitted = form.submitCount > 0;
        const showError = hasValue(error) && (isTouched || wasSubmitted)

        function handleBlur() {
            form.setFieldTouched(name)
        }

        return <FormControl error={showError}>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <RadioGroup
                {...field}
                onBlur={handleBlur}
                value={value || ''}
                row

            >
                {
                    options.map(
                        it => <FormControlLabel
                            key={it.value}
                            value={it.value}
                            label={it.label}
                            control={<Radio/>}
                        />
                    )
                }
            </RadioGroup>
            {
                showError && <FormHelperText>{error}</FormHelperText>
            }
        </FormControl>


    }
    return (
        <Field {...rest}>
            {render}
        </Field>
    )
}
export default XRadioInput;

