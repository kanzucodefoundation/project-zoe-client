import React from "react";
import * as yup from "yup";
import { reqString } from "../../data/validations";
import { ministryCategories } from "../../data/comboCategories";
import { statusCategories } from "../../data/comboCategories";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import { toOptions } from "../../components/inputs/inputHelpers";

import { remoteRoutes } from "../../data/constants";
import { useDispatch } from "react-redux";
import { servicesConstants } from "../../data/tasks/reducer";
import { post } from "../../utils/ajax";
import Toast from "../../utils/Toast";
import { Box } from "@material-ui/core";
import { ICreateTaskDto } from "./Types";

import Navigation from "../../components/layout/Layout";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Header from "./Header";

interface IProps {
  data: any | null;
  done?: () => any;
}

const schema = yup.object().shape({
  ministry: reqString,
  taskName: reqString,
  taskDescription: reqString,
  status: reqString,
});

const initialValues = {
  ministry: "",
  taskName: "",
  taskDescription: "",
  status: "",
};

const RightPadded = ({ children, ...props }: any) => (
  <Grid item xs={6}>
    <Box pr={1} {...props}>
      {children}
    </Box>
  </Grid>
);

const LeftPadded = ({ children, ...props }: any) => (
  <Grid item xs={6}>
    <Box pl={1} {...props}>
      {children}
    </Box>
  </Grid>
);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    filterPaper: {
      borderRadius: 0,
      padding: theme.spacing(2),
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

const AddTasks = ({ done }: IProps) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: ICreateTaskDto = {
      ministry: values.ministry,
      taskName: values.taskName,
      taskDescription: values.taskDescription,
      status: values.status,
    };

    post(
      remoteRoutes.tasks,
      toSave,
      (data) => {
        Toast.info("Operation successful");
        actions.resetForm();
        dispatch({
          type: servicesConstants.servicesAddTask,
          payload: { ...data },
        });
        if (done) done();
      },
      undefined,
      () => {
        actions.setSubmitting(false);
      }
    );
  }

  return (
    <Navigation>
      <Box p={1} className={classes.root}>
        <Header title="Add tasks" />

        <Grid item xs={6}>
          <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={initialValues}
          >
            <Grid spacing={0} container>
              <Grid item xs={12}>
                <XSelectInput
                  name="ministry"
                  label="Ministry"
                  options={toOptions(ministryCategories)}
                  variant="outlined"
                />
              </Grid>
              <RightPadded>
                <XTextInput
                  name="taskName"
                  label="Task Name"
                  type="text"
                  variant="outlined"
                />
              </RightPadded>
              <LeftPadded>
                <XTextInput
                  name="taskDescription"
                  label="Task Description"
                  type="text"
                  variant="outlined"
                />
              </LeftPadded>
                <Grid item xs={12}>
                  <XSelectInput
                    name="status"
                    label="Status"
                    options={toOptions(statusCategories)}
                    variant="outlined"
                  />
                </Grid>
              
            </Grid>
          </XForm>
        </Grid>
      </Box>
    </Navigation>
  );
};

export default AddTasks;
