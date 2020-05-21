import React, {useCallback, useEffect} from "react";
import {search} from "../../utils/ajax";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";

import {hasNoValue, hasValue, IOption} from "../inputs/inputHelpers";
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
const labelParser = (option: IOption) => {
    if (hasValue(option)) {
        return option.name
    }
    return ''
}

const dataCache: any = {}

function hashCode(str: string) {
    return str.split('').reduce((prevHash, currVal) =>
        (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

const isInCache = (filter: any) => {
    const key = hashCode(JSON.stringify(filter))
    if (dataCache[key]) {
        return dataCache[key]
    }
}

const addToCache = (filter: any, resp: any) => {
    const key = hashCode(JSON.stringify(filter))
    dataCache[key] = resp
}


export function PRemoteSelect(props: IProps) {
    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<IOption[]>(props.defaultOptions || []);
    const [query, setQuery] = React.useState<string>('');


    function handleInputChange(event: React.ChangeEvent<any>, value: string) {
        if (!event)
            return
        fetch(value)
    }

    const fetch = useCallback((query: string) => {
        if (hasNoValue(props.remote)) {
            return
        }
        const newFilter = {...props.filter, query, limit: 50}

        const cached = isInCache(newFilter);
        if (cached) {
            setOptions(cached)
            return;
        }
        setLoading(true)
        search(props.remote, newFilter,
            resp => {
                const data = resp.map(props.parser)
                setOptions(data)
                addToCache(newFilter, data)
            },
            undefined,
            () => {
                setLoading(false)
            })
    }, [props.parser, props.filter, props.remote]);

    useEffect(() => {
        fetch(query)
    }, [fetch, query])

    function handleChange(
        event: React.ChangeEvent<{}>,
        value: IOption | null,
        _: AutocompleteChangeReason,
        __?: AutocompleteChangeDetails<any>,
    ) {
        console.log("On change>>>>>")
        props.onChange && props.onChange(value)
    }

    const handleTouched = () => {
        props.onBlur && props.onBlur()
    }

    const handleMouseEnter = () => {
        if (hasNoValue(options)) {
            fetch("")
        }
    }

    const {error, helperText, parser: i, defaultOptions, searchOnline,margin = 'normal', ...autoProps} = {...props}

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

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
            onMouseEnter={handleMouseEnter}
            renderInput={params => {
                return <TextField
                    {...params}
                    {...props.textFieldProps}
                    margin={margin}
                    label={props.label}
                    fullWidth
                    onChange={props.searchOnline ? handleQueryChange : undefined}
                    onBlur={handleTouched}
                    error={props.error}
                    helperText={props.helperText}
                    variant={props.variant}
                    autoComplete="off"
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
