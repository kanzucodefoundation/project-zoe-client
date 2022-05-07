import React, { SyntheticEvent } from 'react';
import { Button } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Form, Formik, FormikHelpers } from 'formik';
import Link from '@material-ui/core/Link';
import HelpIcon from '@material-ui/icons/Help';
import * as yup from 'yup';
import { useHistory } from 'react-router';
import { useLoginStyles } from './loginStyles';
import XTextInput from '../../components/inputs/XTextInput';
import { post } from '../../utils/ajax';
import { isDebug, remoteRoutes } from '../../data/constants';
import Toast from '../../utils/Toast';

export default function ForgotPassword() {
  const classes = useLoginStyles();
  const history = useHistory();

  const onSubmit = (data: any, actions: FormikHelpers<any>) => {
    post(
      remoteRoutes.forgotPassword,
      data,
      (resp) => {
        Toast.success(`Reset Password Link Sent to Email`);
        const { token } = resp;
        localStorage.setItem('password_token', token);
        console.log(resp);
        actions.resetForm();
      },
      () => {
        Toast.error(`Error: Message Not Set. Try Again Later`);
        actions.setSubmitting(false);
        actions.resetForm();
      },
    );
  };

  function handleBackToLogin(e: SyntheticEvent<any>) {
    e.preventDefault();
    history.goBack();
  }

  return (
    <main className={classes.main}>
      <CssBaseline />
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <HelpIcon />
        </Avatar>
        <Typography component="h1">Recover Password</Typography>
        <Formik
          initialValues={{
            username: isDebug ? 'ekastimo@gmail.com' : '',
            // "username": ""
          }}
          validationSchema={schema}
          onSubmit={onSubmit}
        >
          {(formState) => (
            <Form className={classes.form}>
              <XTextInput
                type="email"
                name="username"
                label="Email"
                autoComplete="off"
                autoFocus
                margin="normal"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={formState.isSubmitting}
              >
                Submit
              </Button>
              <Link className={classes.link} onClick={handleBackToLogin}>
                Back To Login Page
              </Link>
            </Form>
          )}
        </Formik>
      </Paper>
    </main>
  );
}

export const schema = yup.object().shape({
  username: yup.string().email('Invalid Email').required('Email is required'),
});
