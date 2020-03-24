import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {hasValue, IOption} from "./inputHelpers";
import {AutocompleteProps} from "@material-ui/lab/Autocomplete/Autocomplete";
import {useField} from "formik";
import {AutocompleteChangeDetails, AutocompleteChangeReason} from "@material-ui/lab/useAutocomplete/useAutocomplete";

interface IProps {
    options: IOption[]
    label: string
    name: string
    variant?: "outlined" | "filled" | 'standard'
    multiple?: any;
    size?: 'medium' | 'small'
}
type AutoProps = Omit<Partial<AutocompleteProps<any>>, 'variant'|'multiple'|'renderInput'>;
const XComboInput = (props: IProps & AutoProps) => {
    const [field, meta, helpers] = useField({name: props.name});
    const error = hasValue(meta.error) ? meta.error : undefined
    const showError = Boolean(error && meta.touched)
    function handleChange(
        event: React.ChangeEvent<{}>,
        value: IOption | null,
        _: AutocompleteChangeReason,
        __?: AutocompleteChangeDetails<any>,
    ) {
        helpers.setValue(value)
    }
    return (
        <Autocomplete
            options={props.options}
            getOptionLabel={(o: any) => o?.label || ''}
            renderInput={params => <TextField
                {...params}
                label={props.label}
                variant={props.variant}
                fullWidth
                error={showError}
                helperText={showError && error}
                onBlur={() => helpers.setTouched(true)}
            />}
            onChange={handleChange}
            onBlur={() => helpers.setTouched(true)}
            value={field.value || (props.multiple ? [] : null)}
            clearOnEscape
            multiple={props.multiple}
            filterSelectedOptions
        />
    );
}

export default XComboInput;
