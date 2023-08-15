import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { reqArray, reqObject, reqString } from '../../../data/validations';
import XForm from '../../../components/forms/XForm';
import XTextInput from '../../../components/inputs/XTextInput';
import XCheckBoxInput from '../../../components/inputs/XCheckBoxInput';
import { remoteRoutes } from '../../../data/constants';
import XRemoteSelect from '../../../components/inputs/XRemoteSelect';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';
import { comboParser } from '../../../components/inputs/sutils';
import { del, get } from '../../../utils/ajax';
import Toast from '../../../utils/Toast';
import XComboInput from '../../../components/inputs/XComboInput';
import { cleanComboValue } from '../../../utils/dataHelpers';
import { IRoles } from './types';

interface IProps {
  data: any;
  isNew: boolean;
  done: (dt: any) => any;
  onDeleted: (dt: any) => any;
  onCancel?: () => any;
}

const schema = yup.object().shape({
  password: reqString.min(8),
  contact: reqObject,
  roles: reqArray,
});

const editSchema = yup.object().shape({
  password: yup.string().min(8),
  roles: reqArray,
});
const initialValues = {
  contact: null,
  password: null,
  roles: [],
  isActive: true,
};
const UserEditor = ({
  data, isNew, done, onDeleted, onCancel,
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const userRoles: string[] = [];

  useEffect(() => {
    get(remoteRoutes.roles, (resp: IRoles[]) => resp.map((it: IRoles) => it.isActive && userRoles.push(it.role)));
  }, [userRoles]);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      ...values,
      contactId: values.contact.id,
      password: values.password,
      roles: cleanComboValue(values.roles),
      isActive: values.isActive,
    };
    const submission: ISubmission = {
      url: remoteRoutes.users,
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
      `${remoteRoutes.users}/${data.id}`,
      (dt) => {
        console.log('Delete response', dt);
        Toast.success('Operation succeeded');
        onDeleted(data);
      },
      undefined,
      () => {
        setLoading(false);
      },
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
          {isNew && (
            <XRemoteSelect
              name="contact"
              label="Person"
              filter={{
                skipUsers: true,
              }}
              remote={remoteRoutes.contactsPeopleCombo}
              parser={comboParser}
              variant="outlined"
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <XComboInput
            name="roles"
            label="Roles"
            options={userRoles}
            variant="outlined"
            multiple
          />
        </Grid>
        <Grid item xs={12}>
          <XTextInput
            name="password"
            label="Password"
            type="password"
            value={'Hello'}
            variant="outlined"
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={12}>
          <XCheckBoxInput
            name="isActive"
            label="Do you want to activate this user?"
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default UserEditor;
