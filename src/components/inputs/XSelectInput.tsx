import * as React from 'react';
import { useField } from 'formik';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { hasValue, IOption } from './sutils';

interface IProps {
  label: string;
  name: string;
  options: IOption[];
  multiple?: boolean;
  required?: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  margin?: 'none' | 'dense' | 'normal';
  onChange?: (value: any) => void;
}

const XSelectInput = (props: IProps) => {
  const {
    name,
    options,
    variant,
    margin = 'normal',
    onChange,
    ...rest
  } = props;
  const [field, meta, helpers] = useField({ name });
  const error = hasValue(meta.error) ? meta.error : undefined;
  const showError = Boolean(error && meta.touched);
  const inputLabel = React.useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: any }>) => {
    const { value } = event.target;
    helpers.setValue(value); // Update formik field value
    onChange?.(value); // Invoke the onChange prop
  };

  return (
    <FormControl
      error={showError}
      fullWidth
      variant={variant}
      margin={margin}
      size={props.size}
    >
      <InputLabel htmlFor={name} ref={inputLabel}>
        {rest.label}
      </InputLabel>
      <Select
        {...rest}
        value={meta.value || (props.multiple ? [] : '')}
        onChange={handleChange}
        onBlur={field.onBlur}
        fullWidth
        multiple={rest.multiple}
        inputProps={{ name }}
        labelWidth={labelWidth}
        autoComplete="off"
      >
        {options.map((it) => (
          <MenuItem value={it.id} key={it.id}>
            {it.name}
          </MenuItem>
        ))}
      </Select>
      {showError && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default XSelectInput;
