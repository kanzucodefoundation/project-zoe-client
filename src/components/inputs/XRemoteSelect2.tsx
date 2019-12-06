import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {search} from "../../utils/ajax";
import CircularProgress from '@material-ui/core/CircularProgress';
import {Field, FieldProps, getIn} from "formik";
import {hasValue} from "./inputHelpers";

interface IProps {
    name: string
    label: string
    remote: string
    value?: any
    parser: (d: any) => ISelectOpt
    onChange?: (d: any) => any
    onBlur?: () => any
    error?: boolean;
    fullWidth?: boolean;
    helperText?: React.ReactNode;
}

export interface ISelectOpt {
    label: string
    id: any
}

export function RemoteSelect(props: IProps) {
    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<ISelectOpt[]>([]);
    const handleInputChange = (event: React.ChangeEvent<any>) => {
        if (!event)
            return
        loadData(event.target.value)
    }

    const loadData = (query: string) => {
        const noQuery = query === undefined || query === null || query.length === 0
        if (noQuery && options.length > 0)
            return
        setLoading(true)
        search(props.remote, {query},
            resp => {
                const data = resp.map(props.parser)
                setOptions(data)
            },
            undefined,
            () => {
                setLoading(false)
            })
    }

    const handleChange = (event: React.ChangeEvent<any>, value: any) => {
        console.log("Value changed", value)
        props.onChange && props.onChange(value)
    }
    const handleTouched = () => {
        props.onBlur && props.onBlur()
    }

    const getOptionLabel = (option: any) => option.label

    return (
        <Autocomplete
            style={{width: 300}}
            getOptionLabel={getOptionLabel}
            filterOptions={x => x}
            options={options}
            onChange={handleChange}
            autoComplete
            includeInputInList
            freeSolo
            disableOpenOnFocus
            value={props.value}
            onInputChange={handleInputChange}
            renderInput={params => (
                <TextField
                    {...params}
                    label={props.label}
                    variant="outlined"
                    fullWidth
                    onBlur={handleTouched}
                    error={props.error}
                    helperText={props.helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}


export const Component = ({field, form, ...other}: FieldProps & IProps) => {
    const error = getIn(form.errors, field.name);
    const isTouched = getIn(form.touched, field.name);
    const wasSubmitted = form.submitCount > 0;
    const showError = hasValue(error) && (isTouched || wasSubmitted)

    function handleTouch() {
        return form.setFieldTouched(field.name, true, true);
    }

    function handleChange(date: any) {
        return form.setFieldValue(field.name, date, true);
    }

    return <RemoteSelect
        {...other}
        onChange={handleChange}
        onBlur={handleTouch}
        error={Boolean(showError)}
        helperText={showError && error}
    />
}

export const XRemoteSelect = (props: IProps) => {
    return (
        <Field
            {...props}
            component={Component}
        />
    )
}
