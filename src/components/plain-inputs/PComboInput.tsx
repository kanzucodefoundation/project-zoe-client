import React, { ChangeEvent } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { AutocompleteProps } from "@material-ui/lab/Autocomplete/Autocomplete";
import { TextFieldProps } from "@material-ui/core/TextField/TextField";
import { IOption } from "../inputs/inputHelpers";


export type ComboValue = string | IOption | (string | IOption)[] | null

interface IProps {
    options: (string | IOption)[]
    label: string
    value: ComboValue
    showError?: boolean
    helperText?: string
    name: string
    variant?: "outlined" | "filled" | 'standard'
    multiple?: any;
    size?: 'medium' | 'small'
    onChange: (value: ComboValue) => void
    onBlur?: () => void
    textFieldProps?: TextFieldProps
    margin?: 'none' | 'dense' | 'normal'
}

type OptionalBool = boolean | undefined;
type BaseProps = AutocompleteProps<string | IOption, OptionalBool, OptionalBool, OptionalBool>
type AutoProps = Omit<BaseProps, 'variant' | 'multiple' | 'renderInput' | 'onChange' | 'value'>;
export type PComboProps = IProps & AutoProps
const PComboInput = (props: PComboProps) => {

    const {
        onChange, onBlur,
        options, value, label,
        variant,
        multiple, margin,
        helperText, showError, textFieldProps,
        ...extraProps
    } = props

    function handleChange(
        event: ChangeEvent<{}>,
        value: ComboValue, _: any
    ) {
        onChange(value)
    }

    function getOptionLabel(o: string | IOption):string {
        if (typeof o === 'string') {
            return o
        }
        if (typeof o === 'object' ) {
            const obj = o as IOption
            return obj?.name
        }
        return ''
    }
    return (
        <Autocomplete
            {...extraProps}
            options={options}
            getOptionLabel={getOptionLabel}
            renderInput={params => <TextField
                {...params}
                {...textFieldProps}
                label={label}
                variant={variant}
                fullWidth
                error={showError}
                helperText={showError && helperText}
                onBlur={onBlur}
                margin={margin}
            />}
            onChange={handleChange}
            onBlur={onBlur}
            multiple={multiple}
            value={value || (multiple ? [] : null)}
            clearOnEscape
            filterSelectedOptions
        />
    );
}

export default PComboInput;
