import React from 'react';
import { useField } from 'formik';
import { hasValue } from './sutils';
import PComboInput, { PComboProps } from '../plain-inputs/PComboInput';

type XComboProps = Omit<
  PComboProps,
  'onChange' | 'value' | 'onBlur' | 'helperText' | 'showError'
>;
const XComboInput = (props: XComboProps) => {
  const [field, meta, helpers] = useField({ name: props.name });
  const error = hasValue(meta.error) ? meta.error : undefined;
  const showError = Boolean(error && meta.touched);

  return (
    <PComboInput
      {...props}
      showError={showError}
      helperText={error}
      onChange={(value: any) => helpers.setValue(value)}
      onBlur={() => helpers.setTouched(true)}
      value={field.value}
    />
  );
};

export default XComboInput;
