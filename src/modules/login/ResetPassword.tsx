import React, { useState } from "react";
import { Button } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useLoginStyles } from "./loginStyles";
import { Form, Formik, FormikHelpers } from "formik";
import XTextInput from "../../components/inputs/XTextInput";
import HelpIcon from "@material-ui/icons/Help";
import { put } from "../../utils/ajax";
import { localRoutes, remoteRoutes } from "../../data/constants";
import * as yup from "yup";
import Toast from "../../utils/Toast";
import { useHistory, useParams } from "react-router";
import { hasNoValue } from "../../components/inputs/inputHelpers";
import Error from "../../components/Error";
import { reqString } from "../../data/validations";

const schema = yup.object().shape({
  password: reqString.min(8, "Password must be atleast 8 characters long"),
});

function ResetPassword() {
  const classes = useLoginStyles();
  const history = useHistory();
  const { token } = useParams<any>();

  const onSubmit = (data: any, actions: FormikHelpers<any>) => {
    
    put(
      remoteRoutes.resetPassword + "/" + token,
      data,
      (resp) => {
        actions.resetForm();
        localStorage.removeItem("password_token");
        history.push(localRoutes.updatePassword);
      },
      () => {
        Toast.error("Password change was unsuccessful. Try again");
        actions.setSubmitting(false);
        //console.log(token);
        actions.resetForm();
      }
    );
  };
  if (hasNoValue(token)) return <Error text="Invalid password reset link" />;

  return (
    <main className={classes.main}>
      <CssBaseline />
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <HelpIcon />
        </Avatar>
        <Typography component="h1">Update Password</Typography>
        <Formik
          initialValues={{
            password: "",
          }}
          validationSchema={schema}
          onSubmit={onSubmit}
        >
          {(formState) => (
          
            <Form className={classes.form}>
              <XTextInput
                type="password"
                name="password"
                label="Password"
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
                Update Password
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </main>
  );
}

export default ResetPassword;
