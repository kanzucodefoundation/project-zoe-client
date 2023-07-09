import React from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { useDispatch } from 'react-redux';
import { Box } from '@material-ui/core';
import { reqEmail, reqObject, reqString } from '../../data/validations';
import {
  ageCategories,
  civilStatusCategories,
  genderCategories,
} from '../../data/comboCategories';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import XSelectInput from '../../components/inputs/XSelectInput';
import { toOptions } from '../../components/inputs/inputHelpers';
import { remoteRoutes } from '../../data/constants';
import { crmConstants } from '../../data/contacts/reducer';
import { post } from '../../utils/ajax';
import Toast from '../../utils/Toast';
import XRadioInput from '../../components/inputs/XRadioInput';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { ICreatePersonDto } from './types';
import { getDayList, getMonthsList } from '../../utils/dateHelpers';
import { XMapsInput } from '../../components/inputs/XMapsInput';
import { parseGooglePlace } from '../../components/plain-inputs/PMapsInput';

interface IProps {
  data: any | null;
  done?: () => any;
}

const schema = yup.object().shape({
  firstName: reqString,
  lastName: reqString,
  gender: reqString,
  civilStatus: reqString,
  ageGroup: reqString,
  cellGroup: reqObject,
  churchLocation: reqObject,
  email: reqEmail,
  phone: reqString,
});

const initialValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  birthDay: '',
  birthMonth: '',
  gender: '',
  civilStatus: '',
  ageGroup: '',
  placeOfWork: '',
  residence: '',
  cellGroup: null,
  churchLocation: null,
  email: '',
  phone: '',
};

const NewPersonForm = ({ done }: IProps) => {
  const dispatch = useDispatch();

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: ICreatePersonDto = {
      churchName: values.churchName,
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      dateOfBirth: `1800-${values.birthMonth}-${values.birthDay}T00:00:00.000Z`,
      gender: values.gender,
      civilStatus: values.civilStatus,

      ageGroup: values.ageGroup,
      placeOfWork: values.placeOfWork,
      residence: parseGooglePlace(values.residence),

      cellGroupId: values.cellGroup.id,
      churchLocationId: values.churchLocation.id,

      email: values.email,
      phone: values.phone,
    };

    post(
      remoteRoutes.contactsPeople,
      toSave,
      (data) => {
        Toast.info('Operation successful');
        actions.resetForm();
        dispatch({
          type: crmConstants.crmAddContact,
          payload: { ...data },
        });
        if (done) done();
      },
      undefined,
      () => {
        actions.setSubmitting(false);
      },
    );
  }

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={initialValues}
      onCancel={done}
    >
      <Grid spacing={2} container className="min-width-100">
        <Grid item xs={6}>
          <XTextInput
            name="churchName"
            label="Church Name"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={6}>
          <XTextInput
            name="firstName"
            label="First Name"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={6}>
          <XTextInput
            name="lastName"
            label="Last Name"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12}>
          <XTextInput
            name="middleName"
            label="Other Names"
            type="text"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={6}>
          <XSelectInput
            name="civilStatus"
            label="Civil Status"
            options={toOptions(civilStatusCategories)}
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={6}>
          <XRadioInput
            name="gender"
            label=""
            options={toOptions(genderCategories)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box width="100%" display="flex">
            <Box width="50%">
              <XSelectInput
                name="birthMonth"
                label="Birth Month"
                options={toOptions(getMonthsList())}
                variant="outlined"
                margin="none"
              />
            </Box>
            <Box width="50%">
              <XSelectInput
                name="birthDay"
                label="Birth Day"
                options={toOptions(getDayList())}
                variant="outlined"
                margin="none"
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <XSelectInput
            name="ageGroup"
            label="Age Group"
            options={toOptions(ageCategories)}
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XTextInput
            name="phone"
            label="Phone"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XTextInput
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XRemoteSelect
            remote={remoteRoutes.groupsCombo}
            filter={{ 'categories[]': 'Location' }}
            parser={({ name, id }: any) => ({ name, id })}
            name="churchLocation"
            label="Church Location"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XRemoteSelect
            remote={remoteRoutes.groupsCombo}
            filter={{ 'categories[]': 'Missional Community' }}
            parser={({ name, id }: any) => ({ name, id })}
            name="cellGroup"
            label="Missional Community"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XTextInput
            name="placeOfWork"
            label="Place of work"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XMapsInput
            name="residence"
            label="Residence"
            variant="outlined"
            margin="none"
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default NewPersonForm;
