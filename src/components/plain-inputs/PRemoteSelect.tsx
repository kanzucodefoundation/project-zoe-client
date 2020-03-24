import React, {useEffect} from "react";
import {search} from "../../utils/ajax";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";

import {hasValue, IOption} from "../inputs/inputHelpers";
import {TextFieldProps} from "@material-ui/core/TextField/TextField";
import {AutocompleteChangeDetails, AutocompleteChangeReason} from "@material-ui/lab/useAutocomplete/useAutocomplete";
import {IXRemoteProps} from "../inputs/XRemoteSelect";


export interface IProps extends IXRemoteProps {

    value?: any
    onChange?: (d: any) => any
    onBlur?: () => any
    error?: boolean;
    fullWidth?: boolean;
    helperText?: React.ReactNode;
    textFieldProps?: TextFieldProps
}

const FakeProgress = () => <div style={{height: 20, width: 20}}>&nbsp;</div>
const labelParser = (option: any) => {
    if (hasValue(option)) {
        return option.label
    }
    return ''
}

const cacheData = (query: any, data: any) => {
    try {
        const key = JSON.stringify(query).replace(/\s+/g, '-').toLowerCase()
        const value = JSON.stringify(data)
        localStorage.setItem(key, value)
    } catch (e) {
        console.error(e)
    }

}

const getCacheData = (query: any,) => {
    try {
        const key = JSON.stringify(query).replace(/\s+/g, '-').toLowerCase()
        const value = localStorage.getItem(key)
        if (value && hasValue(value)) {
            return JSON.parse(value)
        }
    } catch (e) {
        console.error(e)
    }
}

export function PRemoteSelect(props: IProps) {
    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<IOption[]>([]);

    function handleInputChange(event: React.ChangeEvent<any>, value: string) {
        if (!event)
            return
        loadData(value)
    }

    useEffect(() => {
        const filter = {...props.filter, query: "", limit: 50}
        const cached = getCacheData(filter)
        if (cached) {
            setOptions(cached)
            return;
        }
        setLoading(true)
        search(props.remote, filter,
            resp => {
                const data = resp.map(props.parser)
                cacheData(filter, data)
                setOptions(data)
            },
            undefined,
            () => {
                setLoading(false)
            })
    }, [props.filter, props.remote, props.parser])

    function loadData(query: string) {

        const filter = {...props.filter, query, limit: 50}
        const cached = getCacheData(filter)
        if (cached) {
            setOptions(cached)
            return;
        }
        setLoading(true)
        search(props.remote, filter,
            resp => {
                const data = resp.map(props.parser)
                cacheData(filter, data)
                setOptions(data)
            },
            undefined,
            () => {
                setLoading(false)
            })
    }

    function handleChange(
        event: React.ChangeEvent<{}>,
        value: IOption | null,
        _: AutocompleteChangeReason,
        __?: AutocompleteChangeDetails<any>,
    ) {
        props.onChange && props.onChange(value)
    }

    const handleTouched = () => {
        props.onBlur && props.onBlur()
    }
    const {error, helperText, parser, ...autoProps} = {...props}

    return (
        <Autocomplete
            {...autoProps}
            getOptionLabel={labelParser}
            filterOptions={x => x}
            options={options}
            onChange={handleChange}
            autoComplete
            includeInputInList
            freeSolo
            value={props.value}
            loading={loading}
            onInputChange={handleInputChange}
            renderInput={params => {
                return <TextField
                    {...params}
                    {...props.textFieldProps}
                    label={props.label}
                    margin='normal'
                    fullWidth
                    onBlur={handleTouched}
                    error={props.error}
                    helperText={props.helperText}
                    variant={props.variant}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20}/> : <FakeProgress/>}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            }}
        />
    );
}
