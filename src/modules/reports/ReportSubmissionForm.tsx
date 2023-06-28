import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { useDispatch } from 'react-redux';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import XDateInput from '../../components/inputs/XDateInput';
import XRadioInput from '../../components/inputs/XRadioInput';
import XSelectInput from '../../components/inputs/XSelectInput';
import XTextAreaInput from '../../components/inputs/XTextAreaInput';
import { remoteRoutes } from '../../data/constants';
import { crmConstants } from '../../data/contacts/reducer';
import { post } from '../../utils/ajax';
import Toast from '../../utils/Toast';
import { ICreateReportSubmissionDto, IReportColumn } from './types';
import { fieldsToOptions } from '../../components/inputs/inputHelpers';

type ReportFormProps = {
  reportId: string;
  fields: IReportColumn[];
};

const ReportForm: React.FC<ReportFormProps> = ({ reportId, fields }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (values: any) => {
    const reportSubmissionData: ICreateReportSubmissionDto = {
      reportId,
      data: { ...values },
    };

    post(
      remoteRoutes.reportsSubmit,
      reportSubmissionData,
      () => {
        Toast.info('Report submitted successfully');
       //dispatch({
       //  type: crmConstants.crmAddAddress,
       //  payload: { ...data },
       //});
      },
      () => {
        Toast.error('Sorry, there was an error when submitting the report. Please retry.')
      },
      () => {
        // handle error or complete state updates
      },
    );
  };

  function getFieldComponent(field, formData, handleChange) {
    const { name, label, type } = field;
    const value = formData[name] || '';
  
    switch (type) {
      case 'text':
        return (
          <XTextInput
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            label={label}
            variant="outlined"
            margin="none"
          />
        );
      case 'date':
        return (
          <XDateInput
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            label={label}
            variant="outlined"
            margin="none"
          />
        );
      case 'radio':
        return (
          <XRadioInput
            name={name}
            customOnChange={handleChange}
            label={label}
            options={field.options}
          />
        );
      case 'select':
        return (
          <XSelectInput
            name={name}
            label={label}
            options={fieldsToOptions(field.options)}
          />
        );
      case 'textarea':
        return (
          <XTextAreaInput
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            label={label}
            variant="outlined"
            margin="none"
          />
        );
      case 'number':
          return (
            <XTextInput
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              label={label}
              variant="outlined"
              margin="none"
              type="number"
            />
          );
      default:
        return null;
    }
  }
  
  return (
    <XForm
      onSubmit={handleSubmit}
      submitButtonAlignment="left"
      initialValues={formData}
    >
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} md={8} key={field.name}>
              {getFieldComponent(field, formData, handleChange)}
            </Grid>
          ))}
        </Grid>
    </XForm>
  );
};

export default ReportForm;
