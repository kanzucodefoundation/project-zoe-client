import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { useParams, useHistory } from 'react-router';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import XDateInput from '../../components/inputs/XDateInput';
import XRadioInput from '../../components/inputs/XRadioInput';
import XSelectInput from '../../components/inputs/XSelectInput';
import XTextAreaInput from '../../components/inputs/XTextAreaInput';
import { localRoutes, remoteRoutes } from '../../data/constants';
import Toast from '../../utils/Toast';
import {
  ICreateReportSubmissionDto, IReportField,
} from './types';
import { reportOptionToFieldOptions } from '../../components/inputs/inputHelpers';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { get, post } from '../../utils/ajax';
import Loading from '../../components/Loading';
import Layout from '../../components/layout/Layout';

const ReportSubmissionForm = () => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { reportId } = useParams<any>();
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [reportFields, setReportFields] = useState<IReportField[]>([]);
  const history = useHistory();

  const handleChange = (name: string, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchReportData = async () => {
      get(
        `${remoteRoutes.reports}/${reportId}`,
        (response: any) => {
          setIsLoadingData(false);
          if (Array.isArray(response.fields)) {
            setReportFields(response.fields);
          } else {
            Toast.error('Failed to fetch report fields');
          }
        },
        (error) => {
          setIsLoadingData(false);
          Toast.error('Failed to fetch report fields');
          console.error('Failed to fetch report fields', error);
        },
      );
    };

    fetchReportData();
  }, []);

  const handleSmallGroupChange = (name: string, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value.name,
      smallGroupId: value.id,
    }));
  };

  const handleSubmit = (values: any) => {
    const reportSubmissionData: ICreateReportSubmissionDto = {
      reportId,
      data: { ...values },
    };
    // Validate required fields
    const requiredFields = reportFields.filter((field) => field.required);
    const emptyFields = requiredFields.filter(
      (field) => !values[field.name],
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
        history.push(localRoutes.reports);
      },
      () => {
        Toast.error('Sorry, there was an error when submitting the report. Please retry.');
      },
    );
  };

  function getFieldComponent(field: IReportField, formData: any, handleChange: any) {
    const { name, label, type } = field;
    const value = formData[name] || '';
    const options = field.options ? reportOptionToFieldOptions(field.options) : [];

    if (name == 'smallGroupName') {
      return <XRemoteSelect
        remote={remoteRoutes.groupsCombo}
        filter={{ 'categories[]': 'Missional Community' }}
        parser={({ name, id }: any) => ({ name, id })}
        name="smallGroupName"
        label={label}
        variant="outlined"
        customOnChange={(value: string) => handleSmallGroupChange(name, value)}
        margin="none"
      />;
    }

    switch (type) {
      case 'text':
        return (
          <XTextInput
            id={name}
            name={name}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value)
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
            customOnChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value)
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value)
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value)
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value)
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

  if (isLoadingData) {
    return <Loading />;
  }

  return (
    <Layout title='Report Submission Form'>
      <XForm
        onSubmit={handleSubmit}
        submitButtonAlignment="left"
        initialValues={formData}
      >
          <Grid container spacing={2}>
            {reportFields.map((field) => (
              <Grid item xs={12} md={8} key={field.name}>
                {getFieldComponent(field, formData, handleChange)}
              </Grid>
            ))}
          </Grid>
      </XForm>
    </Layout>
  );
};

export default ReportSubmissionForm;
