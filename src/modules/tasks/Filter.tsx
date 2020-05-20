import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import XTextInput from "../../components/inputs/XTextInput";
import { Form, Formik } from "formik";
import { Box } from "@material-ui/core";
import { XRemoteSelect } from "../../components/inputs/XRemoteSelect";
import { remoteRoutes } from "../../data/constants";
import { ISearch } from "../../data/types";

interface IProps {
  onFilter: (data: any) => any;
  loading: boolean;
}

interface ITaskSearchDto extends ISearch {
  cellGroups?: number[];
}

const initialValues: any = {
  cellGroups: [],
  query: "",
  limit: 100,
  skip: 0,
};
const Filter = ({ onFilter, loading }: IProps) => {
  function handleSubmission(values: any) {
    const filter: ITaskSearchDto = {
      cellGroups: values.cellGroups?.map((it: any) => it.value),
      query: values.query,
      limit: 100,
      skip: 0,
    };
    onFilter(filter);
  }

  function handleClear() {
    onFilter(initialValues);
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmission}
      enableReinitialize={false}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ submitForm, isSubmitting, resetForm }) => (
        <Form>
          <Grid spacing={0} container>
            <Grid item xs={12}>
              <XTextInput
                name="query"
                label="Name"
                type="text"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <XRemoteSelect
                remote={remoteRoutes.groupsCombo}
                filter={{ "categories[]": "MC" }}
                parser={({ name, id }: any) => ({ label: name, value: id })}
                name="cellGroups"
                label="Ministry Categories"
                variant="outlined"
                size="small"
                multiple
              />
            </Grid>
            <Grid item xs={12}>
              <Box pt={2}>
                <Grid spacing={2} container>
                  <Grid item xs={6}>
                    <Button
                      disabled={loading}
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        resetForm(initialValues);
                        handleClear();
                      }}
                    >
                      Clear
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      disabled={loading}
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={submitForm}
                    >
                      Apply
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default Filter;
