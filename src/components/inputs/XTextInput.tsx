import * as React from 'react';
import { useField } from 'formik';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { hasValue } from './inputHelpers';

interface IProps {
  name: string;
  isHidden?: boolean;
  isPassword?: boolean;
}

const XTextInput = ({
  name,
  isHidden = false,
  isPassword = false,
  margin = 'normal',
  ...props
}: TextFieldProps & IProps) => {
  const [field, meta, helpers] = useField({ name });

  const [value, setValue] = React.useState(field.value || ''); // Store the value in state
  const inputRef = React.useRef(null);
  const [showPassword, setShowPassword] = React.useState(false); // hide and show password

  React.useEffect(() => {
    if (field.value !== value) {
      setValue(field.value || '');
    }
  }, [field.value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    helpers.setValue(newValue); // Update Formik's field value
  };

  const error = hasValue(meta.error) ? meta.error : undefined;
  const showError = Boolean(error && meta.touched);
  if (isHidden) {
    return (
      <input
        type="hidden"
        name={field.name}
        value={field.value}
        onChange={field.onChange}
      />
    );
  }
  return (
    <TextField
      {...field}
      {...props}
      type={isPassword && !showPassword ? 'password' : 'text'}
      margin={margin}
      fullWidth
      error={showError}
      helperText={showError && error}
      value={value}
      onChange={handleChange}
      inputRef={inputRef}
      autoComplete="nope"
      InputProps={{
        endAdornment: isPassword ? (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((show) => !show)}
              onMouseDown={(e) => e.preventDefault()}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
};

export default XTextInput;
