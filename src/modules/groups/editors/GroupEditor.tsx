import React, { useState, useRef, useEffect } from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { reqObject, reqString } from '../../../data/validations';
import XForm from '../../../components/forms/XForm';
import XTextInput from '../../../components/inputs/XTextInput';
import { remoteRoutes } from '../../../data/constants';
import { GroupPrivacy, IGroup } from '../types';
import XSelectInput from '../../../components/inputs/XSelectInput';
import { toOptions } from '../../../components/inputs/inputHelpers';
import { enumToArray } from '../../../utils/stringHelpers';
import { XRemoteSelect } from '../../../components/inputs/XRemoteSelect';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';
import { del } from '../../../utils/ajax';
import Toast from '../../../utils/Toast';
import { cleanComboValue } from '../../../utils/dataHelpers';
import { parseGooglePlace } from '../../../components/plain-inputs/PMapsInput';
// import { XMapsInput } from '../../../components/inputs/XMapsInput';

interface IProps {
  data?: Partial<IGroup>;
  isNew: boolean;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  onDeleted?: (g: any) => any;
  onCancel?: () => any;
}

const schema = yup.object().shape({
  name: reqString,
  privacy: reqString,
  details: reqString,
  address: reqObject,
  category: reqObject,
});

const initialData = {
  name: '',
  privacy: '',
  details: '',
  address: null,
  category: null,
  parent: null,
};

const GroupEditor = ({
  data,
  isNew,
  onCreated,
  onUpdated,
  onDeleted,
  onCancel,
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<
  google.maps.places.AutocompletePrediction[]
  >([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null | any>(
    null,
  );

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!autocompleteRef.current && window.google && window.google.maps) {
      const inputElement = document.getElementById(
        'address-input',
      ) as HTMLInputElement;

      if (inputElement) {
        // Initialize the Autocomplete instance
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputElement,
        );

        // Add a listener to handle place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.geometry) {
            console.log('Selected place:', place);
            // You can handle the selected place here
          }
        });
      } else {
        console.error('Element with ID "address-input" not found.');
      }
    }
  }, []);

  function handleInputChange(event: any) {
    const { value } = event.target;
    setInputValue(value);

    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }

    autocompleteRef.current.getPlacePredictions(
      { input: value },
      (predictions: any, status: any) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK
          && predictions
        ) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
        }
      },
    );
  }

  function handleSuggestionClick(prediction: any) {
    setInputValue(prediction.description);
    setSuggestions([]);
  }

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      id: values.id,
      name: values.name,
      details: values.details,
      privacy: values.privacy,
      categoryId: values.category.id,
      categoryName: values.category.name,
      parentId: cleanComboValue(values.parent),
      address: parseGooglePlace(values.address),
    };

    const submission: ISubmission = {
      url: remoteRoutes.groups,
      values: toSave,
      actions,
      isNew,
      onAjaxComplete: (resdata: unknown) => {
        if (isNew) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          onCreated && onCreated(resdata);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          onUpdated && onUpdated(resdata);
        }
        actions.resetForm();
        actions.setSubmitting(false);
      },
    };
    handleSubmission(submission);
  }

  function handleDelete() {
    setLoading(true);
    del(
      `${remoteRoutes.groups}/${data?.id}`,
      () => {
        Toast.success('Operation succeeded');
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onDeleted && onDeleted(data?.id);
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  }

  const { placeId, name } = data?.address || {};
  const address = data?.address ? { placeId, description: name } : undefined;

  return (
    <>
      <XForm
        onSubmit={handleSubmit}
        schema={schema}
        initialValues={{ ...initialData, ...data, address }}
        onDelete={handleDelete}
        loading={loading}
        onCancel={onCancel}
      >
        <Grid spacing={1} container>
          <Grid item xs={4}>
            <XSelectInput
              name="privacy"
              label="Privacy"
              options={toOptions(enumToArray(GroupPrivacy))}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={8}>
            <XRemoteSelect
              remote={remoteRoutes.groupsCategories}
              name="category"
              label="Category"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <XRemoteSelect
              remote={remoteRoutes.groupsCombo}
              name="parent"
              label="Parent Group"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <XTextInput
              name="name"
              label="Name"
              type="text"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            {/* <XMapsInput
            name="address"
            label="Address"
            variant="outlined"
            placeholder="Type to search"
          /> */}

            {/* This is temporary to make the form work, then we will use the XMapsInput */}
            <Box position="relative">
              <TextField
                id="address-input"
                name="address"
                label="Address"
                variant="outlined"
                fullWidth
                value={inputValue}
                onChange={handleInputChange}
              />
              {suggestions.length > 0 && (
                <Box
                  className="pac-container"
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  zIndex={1400}
                  maxHeight={500}
                  bgcolor="white"
                  border={1}
                  borderColor="grey.300"
                >
                  {suggestions.map((suggestion) => (
                    <Box
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      p={1}
                      bgcolor="white"
                      borderBottom={1}
                      borderColor="grey.300"
                    >
                      {suggestion.description}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <XTextInput
              name="details"
              label="Details"
              variant="outlined"
              multiline
              rowsMax="3"
              rows={3}
            />
          </Grid>
        </Grid>
      </XForm>
    </>
  );
};

export default GroupEditor;
