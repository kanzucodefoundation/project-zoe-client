import React from 'react';
import { sortBy } from 'lodash';
import { Grid, GridSpacing } from '@material-ui/core';
import XTextInput from '../inputs/XTextInput';
import XDateTimeInput from '../inputs/XDateTimeInput';
import XDateInput from '../inputs/XDateInput';
import XTextAreaInput from '../inputs/XTextAreaInput';
import { hasValue } from '../inputs/inputHelpers';

export type FormField = {
  name: string;
  type: string;
  label: string;
  [name: string]: any;
};

interface IProps {
  fields: FormField[];
  sizes?: {
    [name: string]: number;
  };
  spacing?: GridSpacing;
  parentField?: string;
}

const FormFields = ({
  fields,
  sizes = { xs: 12, md: 6 },
  spacing = 2,
  parentField,
}: IProps) => {
  const createField = (it: FormField) => {
    let { name } = it;
    if (hasValue(parentField)) {
      name = `${parentField}.${it.name}`;
    }
    if (it.type === 'number') {
      return (
        <Grid key={name} item {...sizes}>
          <XTextInput
            name={name}
            label={it.label}
            margin="none"
            variant="outlined"
            type="number"
          />
        </Grid>
      );
    }
    if (it.type === 'datetime') {
      return (
        <Grid key={name} item {...sizes}>
          <XDateTimeInput name={name} label={it.label} variant="outlined" />
        </Grid>
      );
    }
    if (it.type === 'date') {
      return (
        <Grid key={name} item {...sizes}>
          <XDateInput name={name} label={it.label} variant="outlined" />
        </Grid>
      );
    }
    if (it.type === 'textarea') {
      return (
        <Grid key={name} item {...sizes}>
          <XTextAreaInput
            name={name}
            label={it.label}
            variant="outlined"
            margin="none"
          />
        </Grid>
      );
    }
    return (
      <Grid key={name} item {...sizes}>
        <XTextInput
          name={name}
          label={it.label}
          margin="none"
          variant="outlined"
        />
      </Grid>
    );
  };
  return (
    <>
      <Grid spacing={spacing} container className="min-width-100">
        {sortBy(fields, 'order').map(createField)}
      </Grid>
    </>
  );
};

export default FormFields;
