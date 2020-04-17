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
const labelParser = (option: any) => {
    if (hasValue(option)) {
        return option.label
    }
    return ''
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
        const filter = {...props.filter, query, limit: 50}
        setLoading(true)
        search(props.remote, filter,
            resp => {
                const data = resp.map(props.parser)
                setOptions(data)
            },
            undefined,
            () => {
                setLoading(false)
            })
    }, [props.filter, props.parser, props.remote]);

    useEffect(() => {
        if (hasValue(props.remote)) {
            fetch(query)
        }
    }, [fetch, props.remote, query])

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

    const handleMouseEnter = () => {
        if (hasNoValue(options)) {
            fetch("")
        }
    }
    const {error, helperText, parser, defaultOptions, ...autoProps} = {...props}

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
                    label={props.label}
                    margin='normal'
                    fullWidth
                    onBlur={handleTouched}
                    onChange={props.searchOnline ? handleQueryChange : undefined}
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
