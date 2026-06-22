import { TextField } from '@mui/material';
import type { IAddress } from './types';

interface Props {
  label: string;
  value: IAddress | null;
  onChange: (value: IAddress | null) => void;
}

const PlaceAutocomplete = ({ label, value, onChange }: Props) => {
  const addressText = value?.description || value?.name || '';

  return (
    <TextField
      fullWidth
      label={label}
      value={addressText}
      onChange={(event) => {
        const nextValue = event.target.value.trimStart();

        onChange(
          nextValue
            ? {
                description: nextValue,
                name: nextValue,
              }
            : null,
        );
      }}
      helperText="Manual address entry is enabled while Google Places is not configured for this project."
      placeholder="Enter address"
    />
  );
};

export default PlaceAutocomplete;
