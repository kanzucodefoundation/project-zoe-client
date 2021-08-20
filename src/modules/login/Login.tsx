import React, { SyntheticEvent } from "react";
import { Button } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CssBaseline from "@material-ui/core/CssBaseline";
import LockIcon from "@material-ui/icons/LockOutlined";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { Form, Formik, FormikHelpers } from "formik";
import { useDispatch } from "react-redux";
import { handleLogin } from "../../data/coreActions";
import * as yup from "yup";
import { post } from "../../utils/ajax";
import { isDebug, localRoutes, remoteRoutes } from "../../data/constants";
import Toast from "../../utils/Toast";
import XTextInput from "../../components/inputs/XTextInput";
import { useLoginStyles } from "./loginStyles";
import { useHistory } from "react-router";
import Link from "@material-ui/core/Link";

function Login() {
  const classes = useLoginStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const onSubmit = (data: any, actions: FormikHelpers<any>) => {
    post(
      remoteRoutes.login,
      data,
      (resp) => {
        dispatch(handleLogin(resp));
        Toast.success(`Authentication success`);
        history.push(localRoutes.profile);
      },
      () => {
        Toast.error(`Authentication failed, invalid username/password`);
        actions.setSubmitting(false);
      }
    );
  };

  function handleForgotPassword(e: SyntheticEvent<any>) {
    e.preventDefault();
    history.push(localRoutes.forgotPassword);
  }

  return (
    <main className={classes.main}>
      <CssBaseline />
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockIcon />
        </Avatar>
        <Typography component="h1">Sign in</Typography>
        <Formik
          initialValues={{
            username: isDebug ? "ekastimo@gmail.com" : "",
            password: isDebug ? "Xpass@123" : "",
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

              <XTextInput
                type="password"
                name="password"
                label="Password"
                autoComplete="off"
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
                Sign in
              </Button>
              <Link className={classes.link} onClick={handleForgotPassword}>
                Forgot Password?
              </Link>
            </Form>
          )}
        </Formik>
      </Paper>
    </main>
  );
}

export const schema = yup.object().shape({
  username: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default Login;
