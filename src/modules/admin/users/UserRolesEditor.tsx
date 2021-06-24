import React, { useState } from "react";
import * as yup from "yup";
import { reqArray, reqObject, reqString } from "../../../data/validations";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../components/forms/XForm";
import XTextInput from "../../../components/inputs/XTextInput";
import XCheckBoxInput from "../../../components/inputs/XCheckBoxInput";
import { remoteRoutes, rolesList } from "../../../data/constants";
import { XRemoteSelect } from "../../../components/inputs/XRemoteSelect";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import { comboParser } from "../../../components/inputs/inputHelpers";
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
  roleName: reqString,
  capabilities: reqArray,
});

const editSchema = yup.object().shape({
  capabilities: reqArray,
});
const initialValues = {
  roleName: null,
  capabilities: [],
  isActive: true,
};
const UserRolesEditor = ({ data, isNew, done, onDeleted, onCancel }: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      ...values,
      id: values.id,
      capabilities: cleanComboValue(values.capabilities),
      isActive: values.isActive,
    };
    const submission: ISubmission = {
      url: remoteRoutes.userRoles,
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
      `${remoteRoutes.userRoles}/${data.id}`,
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
      schema={isNew ? schema : editSchema}
      initialValues={data || initialValues}
      onDelete={isNew ? undefined : handleDelete}
      loading={loading}
      onCancel={onCancel}
    >
      <Grid spacing={1} container>
        <Grid item xs={12}>

            <XTextInput 
            name="roleName" 
            label="Role Name" 
            type="text" 
            variant="outlined" />

        </Grid>
        <Grid item xs={12}>
          <XComboInput
            name="capabilities"
            label="Capabilities"
            options={rolesList}
            variant="outlined"
            multiple
          />
        </Grid>
        <Grid item xs={12}>
          <XCheckBoxInput
            name="isActive"
            label="Activate Role?"
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default UserRolesEditor;
