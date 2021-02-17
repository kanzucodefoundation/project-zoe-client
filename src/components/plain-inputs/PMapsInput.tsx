import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import { AutocompleteProps } from "@material-ui/lab/Autocomplete/Autocomplete";
import { TextFieldProps } from "@material-ui/core/TextField/TextField";

function loadScript(src: string, position: HTMLElement | null, id: string) {
  if (!position) {
    return;
  }

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2)
  }
}));

export interface IGPlace {
  placeId: string;
  description: string;
}

export const parseGooglePlace = (dt: GooglePlace | IGPlace): IGPlace => {
  const data: any = dt;
  return {
    placeId: data["place_id"] || data.placeId,
    description: dt.description
  };
};

export interface GooglePlace {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings: [
      {
        offset: number;
        length: number;
      }
    ];
  };
}

export interface IProps {
  label: string;
  value: GooglePlace | null;
  showError?: boolean;
  helperText?: string;
  name: string;
  variant?: "outlined" | "filled" | "standard";
  multiple?: any;
  size?: "medium" | "small";
  onChange: (value: GooglePlace | null) => void;
  onBlur?: () => void;
  textFieldProps?: TextFieldProps;
  margin?: "none" | "dense" | "normal";
}

type OptionalBool = boolean | undefined;
type BaseProps = AutocompleteProps<
  GooglePlace,
  OptionalBool,
  OptionalBool,
  OptionalBool
>;
type AutoProps = Omit<
  BaseProps,
  | "variant"
  | "multiple"
  | "renderInput"
  | "onChange"
  | "value"
  | "options"
  | "onInputChange"
  | "renderOption"
>;
export type PMapsProps = IProps & AutoProps;

export default function PMapsInput(props: PMapsProps) {
  const classes = useStyles();

  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState<GooglePlace[]>([]);
  const loaded = React.useRef(false);

  if (typeof window !== "undefined" && !loaded.current) {
    if (!document.querySelector("#google-maps")) {
      const key = process.env.REACT_APP_GOOGLE_KEY;
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`,
        document.querySelector("head"),
        "google-maps"
      );
    }

    loaded.current = true;
  }

  const fetch = React.useMemo(
    () =>
      throttle((request: any, callback: (results?: GooglePlace[]) => void) => {
        (autocompleteService.current as any).getPlacePredictions(
          request,
          callback
        );
      }, 200),
    []
  );

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions(props.value ? [props.value] : []);
      return undefined;
    }
    const autoCompleteReq = {
      input: inputValue,
      fields: ["geometry"],
      componentRestrictions: {
        country: ["ug", "ke"] //Countries...to be updated based on the countries with MCs
      }
    };
    fetch(autoCompleteReq, (results?: GooglePlace[]) => {
      if (active) {
        let newOptions = [] as GooglePlace[];

        if (props.value) {
          newOptions = [props.value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [props.value, inputValue, fetch]);
  const handleTouched = () => {
    props.onBlur && props.onBlur();
  };

  const { label, variant, helperText, showError, margin = "normal" } = props;
  return (
    <Autocomplete
      getOptionLabel={option =>
        typeof option === "string" ? option : option.description
      }
      filterOptions={x => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={props.value}
      onChange={(event: any, newValue: GooglePlace | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        props.onChange(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={params => (
        <TextField
          {...params}
          margin={margin}
          label={label}
          fullWidth
          onBlur={handleTouched}
          error={showError}
          helperText={showError && helperText}
          variant={variant}
        />
      )}
      onBlur={handleTouched}
      renderOption={option => {
        if (option.structured_formatting) {
          const matches =
            option.structured_formatting.main_text_matched_substrings;
          const parts = parse(
            option.structured_formatting.main_text,
            matches.map((match: any) => [
              match.offset,
              match.offset + match.length
            ])
          );

          return (
            <Grid container alignItems="center">
              <Grid item>
                <LocationOnIcon className={classes.icon} />
              </Grid>
              <Grid item xs>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{ fontWeight: part.highlight ? 700 : 400 }}
                  >
                    {part.text}
                  </span>
                ))}
                <Typography variant="body2" color="textSecondary">
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          );
        } else {
          return (
            <Grid container alignItems="center">
              <Grid item>
                <LocationOnIcon className={classes.icon} />
              </Grid>
              <Grid item xs>
                <Typography variant="body2" color="textSecondary">
                  {option.description}
                </Typography>
              </Grid>
            </Grid>
          );
        }
      }}
    />
  );
}
