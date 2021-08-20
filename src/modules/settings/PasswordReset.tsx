import React from "react";
import { Card, CardContent } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import XHeader from "../../components/ibox/XHeader";
import CenteredDiv from "../../components/CenteredDiv";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import { FormikHelpers } from "formik";
import { useSelector } from "react-redux";
import { IState } from "../../data/types";
import { handleSubmission, ISubmission } from "../../utils/formHelpers";
import { remoteRoutes } from "../../data/constants";
import * as yup from "yup";
import { put } from "../../utils/ajax";
import { reqString } from "../../data/validations";
import Toast from "../../utils/Toast";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 0,
    },
  })
);

const schema = yup.object().shape({
  newPassword: reqString.min(8, "Password must be atleast 8 characters long"),
  confirmPassword: reqString.test(
    "passwords-match",
    "Passwords must match",
    function (value) {
      return this.parent.newPassword === value;
    }
  ),
});

const PasswordReset = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave = {
      id: user.id,
      roles: user.roles,
      password: values.confirmPassword,
      oldPassword: values.oldPassword,
    };
    put(
      remoteRoutes.users,
      toSave,
      (resp) => {
        Toast.info("Update successful");
      },
      () => {
        Toast.error("Old password is incorrect");
      }
    );
    actions.resetForm();
  }

  return (
    <Card className={classes.root} elevation={0}>
      <XHeader title="Update Password" />
      <CardContent>
        <CenteredDiv width={300}>
          <XForm onSubmit={handleSubmit} schema={schema}>
            <XTextInput
              label="Old Password"
              name="oldPassword"
              type="password"
              variant="outlined"
              style={{ marginTop: "1rem" }}
            />
            <XTextInput
              label="New Password"
              name="newPassword"
              type="password"
              variant="outlined"
              style={{ marginTop: "1rem" }}
            />
            <XTextInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              variant="outlined"
              style={{ marginTop: "1rem" }}
            />
          </XForm>
        </CenteredDiv>
      </CardContent>
    </Card>
  );
};

export default PasswordReset;
