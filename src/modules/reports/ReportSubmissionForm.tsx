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
import { ICreateReportSubmissionDto, IReportField, IReport, IReportColumn } from './types';
import { reportOptionToFieldOptions } from '../../components/inputs/inputHelpers';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

type ReportSubmissionFormProps = {
  reportId: string;
  fields: IReportField[];
  onSubmit: () => void;
};

const ReportSubmissionForm: React.FC<ReportSubmissionFormProps> = ({ reportId, fields, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});


  const handleChange = (name: string, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (values: any) => {
    const reportSubmissionData: ICreateReportSubmissionDto = {
      reportId,
      data: { ...values },
    };
    // Validate required fields
    const requiredFields = fields.filter((field) => field.required);
    const emptyFields = requiredFields.filter(
      (field) => !values[field.name]
    );

    if (emptyFields.length > 0) {
      Toast.error('Please fill in all required fields');
      return;
    }

    post(
      remoteRoutes.reportsSubmit,
      reportSubmissionData,
      () => {
        Toast.info('Report submitted successfully');
       //dispatch({
       //  type: crmConstants.crmAddAddress,
       //  payload: { ...data },
       //});
       onSubmit();
      },
      () => {
        Toast.error('Sorry, there was an error when submitting the report. Please retry.')
      },
      () => {
        // handle error or complete state updates
      },
    );
  };

  function getFieldComponent(field: IReportField, formData: any , handleChange: any) {
    const { name, label, type } = field;
    const value = formData[name] || '';
    const options = field.options ? reportOptionToFieldOptions(field.options) : [];

    if (name == 'smallGroupName'){
      return <XRemoteSelect
        remote={remoteRoutes.groupsCombo}
        filter={{ 'categories[]': 'Missional Community' }}
        parser={({ name, id }: any) => ({ name, id })}
        name="smallGroupName"
        label={label}
        variant="outlined"
        customOnChange={(value: string) => handleChange(name, value)}
        margin="none"
      />
    }

    switch (type) {
      case 'text':
        return (
          <XTextInput
            id={name}
            name={name}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(name, e.target.value)
            }
            label={label}
            variant="outlined"
            margin="none"
            required={field.required}
          />
        );
      case 'date':
        return (
          <XDateInput
            id={name}
            name={name}
            value={value}
            onChange={(value: MaterialUiPickersDate) => handleChange(name, value)}
            label={label}
            variant="outlined"
            margin="none"
            required={field.required}
          />
        );
      case 'radio':
        return (
          <XRadioInput
            name={name}
            customOnChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(name, e.target.value)
            }
            label={label}
            options={options}
            required={field.required}
          />
        );
      case 'select':
        return (
          <XSelectInput
            name={name}
            label={label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(name, e.target.value)
            }
            options={options}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <XTextAreaInput
            id={name}
            name={name}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(name, e.target.value)
            }
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(name, e.target.value)
              }
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

export default ReportSubmissionForm;
