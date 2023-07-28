import React from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { reqObject, reqString } from '../../../data/validations';
import XForm from '../../../components/forms/XForm';
import XTextInput from '../../../components/inputs/XTextInput';
import XSelectInput from '../../../components/inputs/XSelectInput';
import { toOptions } from '../../../components/inputs/sutils';
import { remoteRoutes } from '../../../data/constants';
import XRemoteSelect from '../../../components/inputs/XRemoteSelect';
import {
  reportFieldTypes,
  responseCategories,
} from '../../../data/comboCategories';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';

interface IProps {
  data?: any | null;
  isNew: boolean;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  done?: () => any;
}

const schema = yup.object().shape({
  label: reqString,
  type: reqString,
  categoryId: reqObject,
});

const initialValues = {
  label: '',
  type: '',
  isRequired: '',
  categoryId: null,
};

const NewReportCategories = ({
  data,
  isNew,
  onCreated,
  onUpdated,
  done,
}: IProps) => {
  function toLowerCase(s: string) {
    return s[0].toLowerCase() + s.slice(1);
  }

  function removeStringSpaces(s: string) {
    return s.replace(/\s+/g, '');
  }

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    // Checking if response to convert it to boolean
    const isRequire = `${values.isRequired}` === 'Yes';

    // Remove Spaces and convert to lowerCase the first Letter
    const removeSpace = removeStringSpaces(values.label);
    const fieldName = toLowerCase(removeSpace);

    const toSave = {
      id: values.id,
      name: fieldName,
      label: values.label,
      type: values.type,
      isRequired: isRequire,
      categoryId: values.categoryId,
    };

    const submission: ISubmission = {
      url: remoteRoutes.eventsField,
      values: toSave,
      actions,
      isNew,
      onAjaxComplete: (ajaxData: any) => {
        if (isNew) {
          onCreated?.(ajaxData);
        } else {
          onUpdated?.(ajaxData);
          done?.();
          window.location.reload();
        }
        actions.resetForm();
        actions.setSubmitting(false);
      },
    };
    handleSubmission(submission);
    done?.();
  }

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={{ ...initialValues, ...data.value }}
      onCancel={done}
    >
      <Grid spacing={2} container className="min-width-100">
        <Grid item xs={12}>
          <XTextInput
            name="label"
            label="Label"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12}>
          <XSelectInput
            name="type"
            label="Type"
            options={toOptions(reportFieldTypes)}
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12}>
          <XSelectInput
            name="isRequired"
            label="IsRequired"
            options={toOptions(responseCategories)}
            variant="outlined"
            margin="none"
          />
        </Grid>

        <Grid item xs={12}>
          <XRemoteSelect
            remote={remoteRoutes.eventsCategories}
            parser={({ name, id }: any) => ({ name, id })}
            name="categoryId"
            label="CategoryId"
            variant="outlined"
            margin="none"
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default NewReportCategories;
