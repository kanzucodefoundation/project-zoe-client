import * as React from "react";
import { Field, FieldProps, getIn } from "formik";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { hasValue, IOption } from "./inputHelpers";

interface IProps {
  label: string;
  name: string;
  options: IOption[];
  customOnChange?: (value: any) => void | undefined;
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

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
            form.setFieldValue(name ,e.target.value)
            if (props.customOnChange !== undefined){
                props.customOnChange(e.target.value)
            }
        }

        return <FormControl error={showError}>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <RadioGroup
                {...field}
                onBlur={handleBlur}
                value={value || ''}
                row
                onChange={handleChange}
            >
                {
                    options.map(
                        it => <FormControlLabel
                            key={it.id}
                            value={it.id}
                            label={it.name}
                            control={<Radio color='primary'/>}
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

