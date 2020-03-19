import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import {top100Films} from "../../stories/inputs/testData";
import {useField} from "formik";
import {hasValue, IOption} from "./inputHelpers";
import {AutocompleteChangeDetails, AutocompleteChangeReason} from "@material-ui/lab/useAutocomplete/useAutocomplete";
import {AutocompleteProps} from "@material-ui/lab/Autocomplete/Autocomplete";

interface IProps {
    options: IOption[]
    label: string
    name: string
    variant?: "outlined" | "filled" | 'standard'
    multiple?: false;
}

export default function XMultiComboInput(props: IProps ) {
    const [field, meta, helpers] = useField({name: props.name});
    const error = hasValue(meta.error) ? meta.error : undefined
    const showError = Boolean(error && meta.touched)

    function handleChange(
        event: React.ChangeEvent<{}>,
        value: any| null,
        _: AutocompleteChangeReason,
        __?: AutocompleteChangeDetails<any>,
    ) {
        helpers.setValue(value)
    }
    return (
        <div >

            <Autocomplete
                multiple
                id="tags-outlined"
                options={top100Films}
                getOptionLabel={(o: any) => o.title}
                filterSelectedOptions
                onChange={handleChange}
                onBlur={(e:any) => helpers.setTouched(true)}
                value={field.value || ""}
                renderInput={params => (
                    <TextField
                        {...params}
                        label={props.label}
                        variant={props.variant}
                        margin='normal'
                        fullWidth
                        error={showError}
                        helperText={showError && error}
                        onBlur={() => helpers.setTouched(true)}
                    />
                )}

            />
            <Autocomplete
                multiple
                options={props.options}
                getOptionLabel={(o: any) => o?.label || ''}
                filterSelectedOptions
                renderInput={params => <TextField
                    {...params}
                    label={props.label}
                    variant={props.variant}
                    margin='normal'
                    fullWidth
                    error={showError}
                    helperText={showError && error}
                    onBlur={() => helpers.setTouched(true)}
                />}
                onChange={handleChange}
                onBlur={() => helpers.setTouched(true)}
                value={field.value || ""}
            />
        </div>
    );
}

