import React from "react";
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
import { useState } from "react";

function ResetPassword() {
  const classes = useLoginStyles();
  const history = useHistory();
  const { token } = useParams<any>();
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLength, setIsLength] = useState<boolean>(false);
  const lengthCheck = yup.string()
    .min(8, 'Password is too short - should be 8 characters minimum.');
  
  const handleChange = (e: any) => {
    setPassword(e.target.value)
  }

  async function validation() {
    setIsLength(await lengthCheck.isValid(password))
  }

  const onSubmit = (data: any, actions: FormikHelpers<any>) => {
    if (isLength) {
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
          console.log(token);
          actions.resetForm();
        }
      );
    } else {
      Toast.error("Password does not meet criteria. Try again");
      actions.resetForm();
    }
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
                autoComplete="off"
                margin="normal"
                onChangeCapture={handleChange}
                onKeyUp={validation}
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
          <Typography variant="body2" style={{color: isLength ? "green" : "red"}}>Password must be 8 characters long</Typography> 
        </Formik>
      </Paper>
    </main>
  );
}

export const schema = yup.object().shape({
  password: yup.string().required("Password is required"),
});

export default ResetPassword;
