import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import XTextInput from "../../components/inputs/XTextInput";
import { Form, Formik } from "formik";
import XSelectInput from "../../components/inputs/XSelectInput";
import { toOptions } from "../../components/inputs/inputHelpers";
import { Box } from "@material-ui/core";
import { ageCategories } from "../../data/comboCategories";
import { XRemoteSelect } from "../../components/inputs/XRemoteSelect";
import { remoteRoutes } from "../../data/constants";
import { ISearch } from "../../data/types";
import { cleanComboValue } from "../../utils/dataHelpers";

interface IProps {
  onFilter: (data: any) => any;
  loading: boolean;
}

interface IContactSearchDto extends ISearch {
  email?: string;
  phone?: string;
  cellGroups?: number[];
  ageGroups?: number[];
  churchLocations?: number[];
}

const initialValues: any = {
  query: "",
  churchLocations: [],
  cellGroups: [],

  email: "",
  phone: "",
  limit: 100,
  skip: 0
};
const Filter = ({ onFilter, loading }: IProps) => {
  function handleSubmission(values: any) {
    const filter: IContactSearchDto = {
      ageGroups: values.ageGroups,
      cellGroups: cleanComboValue(values.cellGroups),
      churchLocations: cleanComboValue(values.churchLocations),
      query: values.query,
      email: values.email,
      phone: values.phone,
      limit: 100,
      skip: 0
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
              <XSelectInput
                name="ageGroups"
                label="Age Groups"
                options={toOptions(ageCategories)}
                variant="outlined"
                size="small"
                multiple
              />
            </Grid>
            <Grid item xs={12}>
              <XTextInput
                name="email"
                label="Email"
                type="email"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <XTextInput
                name="phone"
                label="Phone"
                type="text"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <XRemoteSelect
                remote={remoteRoutes.groupsCombo}
                filter={{ "categories[]": "Location" }}
                parser={({ name, id }: any) => ({ name: name, id: id })}
                name="churchLocations"
                label="Church Locations"
                variant="outlined"
                size="small"
                multiple
              />
            </Grid>
            <Grid item xs={12}>
              <XRemoteSelect
                remote={remoteRoutes.groupsCombo}
                filter={{ "categories[]": "MC" }}
                parser={({ name, id }: any) => ({ name: name, id: id })}
                name="cellGroups"
                label="Missional Communities"
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
