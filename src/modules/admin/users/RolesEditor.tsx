import React, { useState } from "react";
import * as yup from "yup";
import { reqArray, reqObject, reqString } from "../../../data/validations";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../components/forms/XForm";
import XTextInput from "../../../components/inputs/XTextInput";
import XCheckBoxInput from "../../../components/inputs/XCheckBoxInput";
import { remoteRoutes, permissionsList } from "../../../data/constants";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import { del } from "../../../utils/ajax";
import Toast from "../../../utils/Toast";
import XComboInput from "../../../components/inputs/XComboInput";
import { cleanComboValue } from "../../../utils/dataHelpers";

interface IProps {
  data: any;
  isNew: boolean;
  done: (dt: any) => any;
  onDeleted: (dt: any) => any;
  onCancel?: () => any;
}

const schema = yup.object().shape({
  role: reqString,
  permissions: reqArray,
  description: reqString,
});

const initialValues = {
  role: null,
  permissions: [],
  isActive: true,
};
const RolesEditor = ({ data, isNew, done, onDeleted, onCancel }: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      ...values,
      id: values.id,
      permissions: cleanComboValue(values.permissions),
      isActive: values.isActive,
    };
    const submission: ISubmission = {
      url: remoteRoutes.roles,
      values: toSave,
      actions,
      isNew,
      onAjaxComplete: done,
    };
    handleSubmission(submission);
  }

  function handleDelete() {
    setLoading(true);
    del(
      `${remoteRoutes.roles}/${data.id}`,
      (dt) => {
        Toast.success("Operation succeeded");
        onDeleted(data);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={data || initialValues}
      onDelete={isNew ? undefined : handleDelete}
      loading={loading}
      onCancel={onCancel}
    >
      <Grid spacing={1} container>
        <Grid item xs={12}>
          <XTextInput name="role" label="Role" type="text" variant="outlined" />
        </Grid>
        <Grid item xs={12}>
          <XTextInput
            name="description"
            label="Description"
            type="text"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <XComboInput
            name="permissions"
            label="Permissions"
            options={permissionsList}
            variant="outlined"
            multiple
          />
        </Grid>
        <Grid item xs={12}>
          <XCheckBoxInput name="isActive" label="Activate Role?" />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default RolesEditor;
