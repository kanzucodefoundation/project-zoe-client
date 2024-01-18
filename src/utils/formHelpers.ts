import { FormikHelpers } from 'formik';
import { handleError, post, patch } from './ajax';
import Toast from './Toast';

export interface ISubmission {
  url: string;
  values: any;
  isNew: boolean;
  actions: FormikHelpers<any>;
  onAjaxComplete?: (data: any) => any;
}

export function handleSubmission(submission: ISubmission) {
  const { isNew, actions, values, onAjaxComplete, url } = submission;
  if (isNew) {
    post(
      url,
      values,
      (data) => {
        Toast.info('Operation successful');
        actions.resetForm();
        onAjaxComplete && onAjaxComplete(data);
      },
      (err, resp) => {
        handleError(err, resp);
      },
      () => {
        actions.setSubmitting(false);
      },
    );
  } else {
    patch(
      url,
      values,
      (data) => {
        Toast.info('Update successful');
        console.log(data);
        actions.resetForm();
        onAjaxComplete && onAjaxComplete(data);
      },
      (err, resp) => {
        handleError(err, resp);
      },
      () => {
        actions.setSubmitting(false);
      },
    );
  }
}
