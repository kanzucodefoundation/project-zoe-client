import React, { useState } from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { Box } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { reqEmail, reqObject, reqString } from '../../data/validations';
import {
  ageCategories,
  civilStatusCategories,
  genderCategories,
  responseCategories,
} from '../../data/comboCategories';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import XSelectInput from '../../components/inputs/XSelectInput';
import { hasValue, toOptions } from '../../components/inputs/inputHelpers';

import { remoteRoutes } from '../../data/constants';
import { post } from '../../utils/ajax';
import Toast from '../../utils/Toast';
import XRadioInput from '../../components/inputs/XRadioInput';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { getDayList, getMonthsList } from '../../utils/dateHelpers';
import { ICreatePersonDto } from '../contacts/types';
import { XMapsInput } from '../../components/inputs/XMapsInput';
import { parseGooglePlace } from '../../components/plain-inputs/PMapsInput';
import XRemoteSelectLoadOnOpen from '../../components/inputs/XRemoteSelectLoadOnOpen';

interface IProps {
  data: any | null;
  done?: () => any;
}

const schema = yup.object().shape({
  churchName: reqString,
  firstName: reqString,
  otherNames: reqString,
  gender: reqString,
  birthDay: reqString,
  birthMonth: reqString,
  civilStatus: reqString,
  ageGroup: reqString,
  churchLocation: reqObject,
  email: reqEmail,
  phone: reqString,
  inCell: reqString,
});

const initialValues = {
  churchName: '',
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
  inCell: '',
  joinCell: '',
};

const processName = (name: string): string[] => {
  const [lastName, ...otherNames] = name.split(' ');
  if (hasValue(otherNames)) {
    return [lastName, otherNames.join(' ')];
  } return [lastName];
};

const RegisterForm = ({ done }: IProps) => {
  // Does visitor belong to a missional community state
  const [inMc, setIsInMc] = useState(false);

  // Does visitor want to join a misional community state
  const [joinMc, setIsJoinMc] = useState(false);

  // The visitor's church name state
  const [userChurchName, setChurchName] = useState('');

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const [lastName, middleName] = processName(values.otherNames);

    const toSave: ICreatePersonDto = {
      churchName: values.churchName,
      firstName: values.firstName,
      middleName,
      lastName,
      dateOfBirth: `1800-${values.birthMonth}-${values.birthDay}T00:00:00.000Z`,
      gender: values.gender,
      civilStatus: values.civilStatus,
      ageGroup: values.ageGroup,
      placeOfWork: values.placeOfWork,
      residence: parseGooglePlace(values.residence),
      cellGroupId: values.cellGroup?.id,
      churchLocationId: values.churchLocation.id,
      email: values.email,
      phone: values.phone,
      inCell: values.inCell,
      joinCell: values.joinCell,
    };

    post(
      remoteRoutes.register,
      toSave,
      (data) => {
        Toast.info('Registration successful. Please check your email for a link to setup a password');
        actions.resetForm();
        if (done) done();
      },
      undefined,
      () => {
        actions.setSubmitting(false);
      },
    );
  }

  // Does visitor belong to/want to join a missional community function
  const changeMCStatus = (value: any) => {
    value === 'Yes' ? setIsInMc(true) : setIsInMc(false);
    value === 'No' ? setIsJoinMc(true) : setIsJoinMc(false);
  };

  const handleOnChurchNameChange = (event: any) => {
    const churchName: string = event.target.value;
    setChurchName(churchName.toLowerCase().replace(/\s/g, ""));
  };

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={initialValues}
    >
      <div style={{ padding: 8 }}>
        <Grid spacing={2} container className="min-width-100">
          <Grid item xs={12}>
            <Box pt={2}>
              <Typography variant="caption">Basic Data</Typography>
            </Box>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <XTextInput
              name="churchName"
              label="Church Name"
              type="text"
              variant="outlined"
              margin="none"
              onBlur={handleOnChurchNameChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <XTextInput
              name="firstName"
              label="First Name"
              type="text"
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <XTextInput
              name="otherNames"
              label="Other Names"
              type="text"
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box pt={1} pl={1}>
              <XRadioInput
                name="gender"
                label="Gender"
                options={toOptions(genderCategories)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <XSelectInput
              name="civilStatus"
              label="Civil Status"
              options={toOptions(civilStatusCategories)}
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <XSelectInput
              name="ageGroup"
              label="Age Group"
              options={toOptions(ageCategories)}
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <XSelectInput
              name="birthMonth"
              label="Birth Month"
              options={toOptions(getMonthsList())}
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <XSelectInput
              name="birthDay"
              label="Birth Day"
              options={toOptions(getDayList())}
              variant="outlined"
              margin="none"
            />
          </Grid>

          <Grid item xs={12}>
            <Box pt={2}>
              <Typography variant="caption">Address details</Typography>
            </Box>
            <Divider />
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
            <XRemoteSelectLoadOnOpen 
              remote={remoteRoutes.groupsCombo+'?categories[]=Location&churchName='+userChurchName}
              name="churchLocation"
              label="Church Location"
              variant="outlined"
              margin="none"
              placeholder="Type to search"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <XRadioInput
                name="inCell"
                label="Do you belong to an MC?"
                options={toOptions(responseCategories)}
                customOnChange={changeMCStatus}
              />
            </Box>
          </Grid>
          {/* Field appears if user belongs to a Missional Community */}
          {inMc && (
            <Grid item xs={12} md={12}>
              <XRemoteSelect
                remote={remoteRoutes.groupsCombo}
                filter={{ 'categories[]': 'MC' }}
                parser={({ name, id }: any) => ({ name, id })}
                name="cellGroup"
                label="Missional Community"
                variant="outlined"
                margin="none"
                placeholder="Type to search"
              />
            </Grid>
          )}
          {/* Field appears if user does not belong to a Missional Community */}
          {joinMc && (
            <Grid item xs={12} md={12}>
              <Box>
                <XRadioInput
                  name="joinCell"
                  label="Do you want to join a Missional Community?"
                  options={toOptions(responseCategories)}
                />
              </Box>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <XMapsInput
              name="residence"
              label="Residence"
              variant="outlined"
              margin="none"
              placeholder="Type to search"
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
        </Grid>
      </div>
    </XForm>
  );
};

export default RegisterForm;
