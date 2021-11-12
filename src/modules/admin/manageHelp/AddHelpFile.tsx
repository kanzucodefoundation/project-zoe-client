import React from 'react';
import * as yup from 'yup';
import { reqString } from '../../../data/validations';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import XForm from '../../../components/forms/XForm';
import XTextInput from '../../../components/inputs/XTextInput';
import { remoteRoutes } from '../../../data/constants';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';

interface IProps {
  data?: any | null;
  isNew: boolean;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  done?: () => any;
}

const schema = yup.object().shape({
  title: reqString,
  url: reqString,
  category: reqString,
});

const initialValues = {
  title: '',
  url: '',
  category: '',
};

function checkUrl(str: string){
  if (str.startsWith('https')){
    let resp = str.split('=');
    return resp[1]
  }
  else if (str.startsWith('www')){
    let resp = str.split('=');
    return resp[1]
  }
  else if(str.startsWith('//')) {
    let resp = str.split('=');
    return resp[1]
  }
  return str 
}


const AddHelpFileButton = ({data, isNew, onCreated, onUpdated, done}: IProps) => {

  //Function to handle submissions
  function handleSubmit(values: any, actions: FormikHelpers<any>){
    const editUrl = checkUrl(values.url);

    const toSave = {
      id: values.id,
      url: editUrl,
      title: values.title,
      category: values.category,
    };
    console.log(toSave);

    const submission: ISubmission = {
      url: remoteRoutes.help, 
      values: toSave, 
      actions,
      isNew,
      onAjaxComplete: (data: any) => {
        if (isNew) {
          onCreated && onCreated(data);
        } else {
          onUpdated && onUpdated(data);
          if (done) done();
          window.location.reload();
        }
        actions.resetForm();
        actions.setSubmitting(false);
      },
    };

    handleSubmission(submission);
    if (done) done();
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
          name="title"
          label = "Title"
          type="text"
          variant="outlined"
          margin="none"
        />
      </Grid>
      <Grid item xs={12}>
        <XTextInput
          name="url"
          label = "URL"
          type="text"
          variant="outlined"
          margin="none"
        />
      </Grid>
      <Grid item xs={12}>
        <XTextInput
          name="category"
          label = "Category"
          type="text"
          variant="outlined"
          margin="none"
        />
      </Grid>
    </Grid>
  </XForm>
  );
}; 

export default AddHelpFileButton;
