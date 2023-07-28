import React from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { useDispatch } from 'react-redux';
import { reqString } from '../../../data/validations';
import XForm from '../../../components/forms/XForm';
import XTextInput from '../../../components/inputs/XTextInput';
import XSelectInput from '../../../components/inputs/XSelectInput';
import { toOptions } from '../../../components/inputs/sutils';

import { remoteRoutes } from '../../../data/constants';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';
import { ITag, tagCategories } from './types';
import { tagConstants, tagsDeleteTag } from '../../../data/tags/reducer';
import {
  coreStartGlobalLoader,
  coreStopGlobalLoader,
} from '../../../data/coreActions';
import { del } from '../../../utils/ajax';
import XColorPicker from '../../../components/inputs/XColorPicker';

interface IProps {
  data: ITag | null;
  isNew: boolean;
  done?: () => any;
}

const schema = yup.object().shape({
  name: reqString,
  category: reqString.oneOf(tagCategories),
  color: reqString,
});

const TagEditor = ({ data, isNew, done }: IProps) => {
  const dispatch = useDispatch();

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const submission: ISubmission = {
      url: remoteRoutes.tags,
      values,
      actions,
      isNew,
      onAjaxComplete: (ajaxData: any) => {
        dispatch({
          type: isNew ? tagConstants.tagsAdd : tagConstants.tagsEdit,
          payload: { ...ajaxData },
        });
        done?.();
      },
    };
    handleSubmission(submission);
  }

  function handleDelete() {
    if (!data) {
      return;
    }
    dispatch(coreStartGlobalLoader());
    const url = `${remoteRoutes.tags}/${data.id}`;
    del(
      url,
      () => {
        dispatch(tagsDeleteTag(data.id));
        if (done) done();
      },
      undefined,
      () => {
        dispatch(coreStopGlobalLoader());
      },
    );
  }

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={data}
      onDelete={isNew ? undefined : handleDelete}
      onCancel={done}
    >
      <Grid spacing={0} container>
        <Grid item xs={12}>
          <XSelectInput
            name="category"
            label="Category"
            options={toOptions(tagCategories)}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <XTextInput name="name" label="Name" type="text" variant="outlined" />
        </Grid>
        <Grid item xs={12}>
          <XTextInput
            name="color"
            label="Color"
            type="text"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <XColorPicker name="color" label="Color" />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default TagEditor;
