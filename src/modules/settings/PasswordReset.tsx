import React, { useState } from "react";
import { Card, CardContent, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import XHeader from "../../components/ibox/XHeader";
import CenteredDiv from "../../components/CenteredDiv";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import Toast from "../../utils/Toast";
import { FormikHelpers } from "formik";
import { useSelector } from "react-redux";
import { IState } from "../../data/types";
import { handleSubmission, ISubmission } from "../../utils/formHelpers";
import { remoteRoutes } from "../../data/constants";
import * as yup from "yup";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 0
    }
  })
);

const PasswordReset = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [passwordOne, setPasswordOne] = useState("");
  const [passwordTwo, setPasswordTwo] = useState("");
  const [isLength, setIsLength] = useState<boolean>(false);
  const [isMatch, setIsMatch] = useState<boolean>(false);
  const lengthCheck = yup.string()
    .required("Password is required")
    .min(8, 'Password is too short - should be 8 characters minimum.');

  const handleChangeOne = (e: any) => {
    setPasswordOne(e.target.value)
  }

  const handleChangeTwo = (e: any) => {
    setPasswordTwo(e.target.value)
  }

  async function validation() {
    setIsLength(await lengthCheck.isValid(passwordOne))
    setIsMatch(passwordOne === passwordTwo)
  }

  function handleSubmit(values: any, actions: FormikHelpers<any>) {

   if (isMatch && isLength) {
      const toSave = {
        id: user.id,
        roles: user.roles,
        password: values.confirmPassword
      }
      const submission: ISubmission = {
        url: remoteRoutes.users,
        values: toSave,
        actions,
        isNew: false,
      };
      handleSubmission(submission)
    } else {
      Toast.error("Your Password Does Not Meet The Criteria Below")
      actions.resetForm();
    }
  }

  return (
    <Card className={classes.root} elevation={0}>
      <XHeader title="Update Password" />
      <CardContent>
        <CenteredDiv width={300}>
          <XForm
            onSubmit={handleSubmit}
          >
            <XTextInput
              label="New Password"
              name="newPassword"
              type="password"
              onChangeCapture={handleChangeOne}
              onKeyUp={validation}
              variant="outlined"
              style={{ marginTop: "1rem" }}
            />
            <XTextInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              onChangeCapture={handleChangeTwo}
              onKeyUp={validation}
              variant="outlined"
              style={{ marginTop: "1rem" }}
            />
            <Typography variant="body2" style={{color: isLength ? "green" : "red"}}>Password must be 8 characters long</Typography>
            <Typography variant="body2" style={{color: isMatch ? "green" : "red"}}>Passwords must match</Typography>
          </XForm>
        </CenteredDiv>
      </CardContent>
    </Card>
  );
};

export default PasswordReset;
