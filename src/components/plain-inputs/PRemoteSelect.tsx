import React, {useCallback, useEffect} from "react";
import {search} from "../../utils/ajax";
import Autocomplete, {createFilterOptions} from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import {hasNoValue, hasValue, IOption} from "../inputs/inputHelpers";
import {TextFieldProps} from "@material-ui/core/TextField/TextField";
import {IXRemoteProps} from "../inputs/XRemoteSelect";

const filter = createFilterOptions<IOption>();

export interface IPRemoteSelectProps extends IXRemoteProps {
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

const filterOptions = (options: IOption[], params: any) => {
    const filtered = filter(options, params) as IOption[];
    // Suggest the creation of a new value
    if (params.inputValue !== '') {
        filtered.push({
            id: params.inputValue,
            name: `Add "${params.inputValue}"`,
        });
    }
    return filtered;
}

export function PRemoteSelect(props: IPRemoteSelectProps) {
    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<IOption[]>(props.defaultOptions || []);
    const [query, setQuery] = React.useState<string>('');
    const [inputValue, setInputValue] = React.useState('');

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

    const handleTouched = () => {
        props.onBlur && props.onBlur()
    }

    const {
        error,
        helperText,
        parser: i,
        defaultOptions,
        searchOnline,
        margin = 'normal',
        freeSolo,
        ...autoProps
    } = props


    return (
        <Autocomplete
            {...autoProps}
            value={props.value}
            onChange={(_: any, newValue: IOption | null) => {
                props.onChange && props.onChange(newValue)
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
                if (props.searchOnline) {
                    setQuery(newInputValue)
                }
            }}
            getOptionLabel={labelParser}
            filterOptions={props.searchOnline ? x => x : freeSolo ? filterOptions : undefined}
            options={options}
            autoComplete
            freeSolo
            loading={loading}
            renderInput={params => {
                return <TextField
                    {...params}
                    {...props.textFieldProps}
                    margin={margin}
                    label={props.label}
                    fullWidth
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
