import React, { useState } from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
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
import { XMapsInput } from '../../../components/inputs/XMapsInput';

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
  // address: reqObject,
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
      onAjaxComplete: (data: any) => {
        if (isNew) {
          onCreated && onCreated(data);
        } else {
          onUpdated && onUpdated(data);
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
          <XTextInput name="name" label="Name" type="text" variant="outlined" />
        </Grid>
        <Grid item xs={12}>
          <XMapsInput
            name="address"
            label="Address"
            variant="outlined"
            placeholder="Type to search"
          />
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
  );
};

export default GroupEditor;
