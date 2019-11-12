import * as React from 'react'
import {Field, FieldProps, getIn} from 'formik';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {hasValue, IOption} from "./inputHelpers";

interface IProps {
    label: string
    name: string
    options: IOption[]
    multiple?: boolean
    variant?: 'standard' | 'outlined' | 'filled'
}

const Component = (props: FieldProps & IProps) => {
    const {field, form, options, ...rest} = props
    const name = field.name;
    let value = field.value;
    if (!value && Boolean(rest.multiple)) {
        value = []
    }
    if (!value && !Boolean(rest.multiple)) {
        value = ''
    }

    const error = getIn(form.errors, name);
    const isTouched = getIn(form.touched, name);
    const wasSubmitted = form.submitCount > 0;
    const showError = hasValue(error) && (isTouched || wasSubmitted)

    function handleTouched() {
        form.setFieldTouched(field.name, true, true);
    }
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        form.setFieldValue(field.name, event.target.value, true);
    };

    const inputLabel = React.useRef<HTMLLabelElement>(null);
    const [labelWidth, setLabelWidth] = React.useState(0);
    React.useEffect(() => {
        setLabelWidth(inputLabel.current!.offsetWidth);
    }, []);

    return <FormControl error={showError} fullWidth variant={props.variant} margin='normal'>
        <InputLabel htmlFor={name} ref={inputLabel}>{rest.label}</InputLabel>
        <Select
            onClose={handleTouched}
            onBlur={handleTouched}
            onChange={handleChange}
            value={value}
            fullWidth
            multiple={rest.multiple}
            inputProps={{name}}
            labelWidth={labelWidth}
        >
            {
                options.map(
                    it => <MenuItem
                        value={it.value}
                        key={it.value}
                    >{it.label}</MenuItem>
                )
            }
        </Select>
        {
            showError && <FormHelperText>{error}</FormHelperText>
        }
    </FormControl>
}

const SelectInput = (props: IProps) => {
    return (
        <Field
            {...props}
            component={Component}
        />
    )
}

export default SelectInput
