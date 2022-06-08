import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useField } from 'formik';
import { search } from '../../utils/ajax';

interface SelectOption {
  id: number;
  name: string;
  categoryId?: string;
}

export default function XRemoteSelectLoadOnOpen(props: any) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<SelectOption[]>([]);
  const loading = open && options.length === 0;
  const [field, _meta, helpers] = useField({ name: props.name });

  React.useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      if (active) {
        search(
          props.remote,
          [],
          (resp: any[] = []) => {
            if (!Array.isArray(resp)) {
              console.error('Invalid response for remote select', resp);
            } else if (props.parser) {
              const data: any[] = resp.map(props.parser);
              setOptions(data);
            } else {
              setOptions(resp);
            }
          },
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  function handleChange(event: any, newValue: string | null) {
    helpers.setValue(newValue);
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      value={field.value}
      getOptionLabel={(option) => option.name}
      options={options}
      onChange={handleChange}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          name={props.name}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
