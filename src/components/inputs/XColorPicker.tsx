import React from 'react';
import {SketchPicker} from 'react-color';

import {Field, FieldProps} from 'formik';
import {TextFieldProps} from '@material-ui/core/TextField';
import {isValidColor} from "../../utils/colorHelpers";


const XColorPicker = (props: TextFieldProps & IProps) => {
    const {...rest} = props
    const render = (fieldProps: FieldProps) => {
        const {field, form, ...rest} = fieldProps
        let value = field.value;
        // const name = field.name;
        // const error = getIn(form.errors, name);
        // const isTouched = getIn(form.touched, name);
        // const wasSubmitted = form.submitCount > 0;
        //const showError = hasValue(error) && (isTouched || wasSubmitted)

        function handleTouched() {
            form.setFieldTouched(field.name, true, true);
        }

        const handleChangeComplete = (color: any) => {
            form.setFieldValue(field.name, color.hex);
        };
        return <SketchPicker
            color={isValidColor(value) ? value : undefined}
            onChangeComplete={handleChangeComplete}
            onChange={handleTouched}
            {...rest}
        />
    }
    return (
        <Field {...rest}>
            {render}
        </Field>
    )
}

interface IProps {
    onChange?: (hexColor: string) => any
    value?: string
    name?: string
    label?: string
}

export const ColorPicker = ({onChange, value = '#fff'}: IProps) => {
    const handleChangeComplete = (color: any) => {
        onChange && onChange(color.hex)
    }
    return (
        <div>
            <SketchPicker
                color={value}
                onChangeComplete={handleChangeComplete}
            />
        </div>
    );
}


export default XColorPicker;
