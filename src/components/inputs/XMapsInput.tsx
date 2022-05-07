import React from 'react';
import { useField } from 'formik';
import { hasValue } from './inputHelpers';
import PMapsInput, {
  GooglePlace,
  PMapsProps,
} from '../plain-inputs/PMapsInput';

type XRemoteProps = Omit<
PMapsProps,
'onChange' | 'value' | 'onBlur' | 'helperText' | 'showError'
>;

export const XMapsInput = (props: XRemoteProps) => {
  const [field, meta, helpers] = useField({ name: props.name });
  const error = hasValue(meta.error) ? meta.error : undefined;
  const showError = Boolean(error && meta.touched);

  function handleTouch() {
    helpers.setTouched(true);
  }

  function handleChange(value: GooglePlace | null) {
    helpers.setValue(value);
  }

  return <PMapsInput
        {...props}
        value={field.value}
        onChange={handleChange}
        onBlur={handleTouch}
        showError={Boolean(showError)}
        helperText={showError ? error : undefined}
    />;
};
