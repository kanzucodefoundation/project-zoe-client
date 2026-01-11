/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { useParams, useHistory } from 'react-router';
import { ToastContainer } from 'react-toastify';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import XDateInput from '../../components/inputs/XDateInput';
import XRadioInput from '../../components/inputs/XRadioInput';
import XSelectInput from '../../components/inputs/XSelectInput';
import XTextAreaInput from '../../components/inputs/XTextAreaInput';
import { localRoutes, remoteRoutes } from '../../data/constants';
import Toast from '../../utils/Toast';
import { ICreateReportSubmissionDto, IReportField } from './types';
import {
  toOptions,
} from '../../components/inputs/inputHelpers';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { get, post } from '../../utils/ajax';
import Loading from '../../components/Loading';
import Layout from '../../components/layout/Layout';
import 'react-toastify/dist/ReactToastify.css';

const ReportSubmissionForm = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { reportId } = useParams<any>();
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [reportFields, setReportFields] = useState<IReportField[]>([]);
  const history = useHistory();
  const [validationErrors, setValidationErrors] = useState<
  Record<string, string>
  >({});
  const [reportName, setReportName] = useState<string>('');

  const handleChange = (name: string, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setValidationErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };

  useEffect(() => {
    const fetchReportData = async () => {
      get(
        `${remoteRoutes.reports}/${reportId}`,
        (response: any) => {
          setIsLoadingData(false);
          if (Array.isArray(response.fields)) {
            setReportFields(response.fields);
            setReportName(response.name);
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
  }, [reportId]);

  const handleSmallGroupChange = (name: string, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      smallGroupName: value?.name,
      smallGroupId: value?.id,
    }));
    setValidationErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.smallGroupName;
      return newErrors;
    });
  };

  const resetForm = () => {
    setFormData({});
    setValidationErrors({});
  };

  const handleSubmit = async (values: any) => {
    const reportSubmissionData: ICreateReportSubmissionDto = {
      reportId,
      data: { ...values },
    };
    // Validate required fields
    const requiredFields = reportFields.filter((field) => field.required);
    const emptyFields = requiredFields.filter((field) => !values[field.name]);
    if (emptyFields.length > 0) {
      const emptyFieldLabels = emptyFields.map((field) => field.label);
      const labelsCommaSeparated = emptyFieldLabels.join(', ');
      Toast.error(
        `Looks like some required fields are missing: ${labelsCommaSeparated}. Please complete these and try again.`,
      );
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        post(
          `${remoteRoutes.reports}/${reportId}/submissions`,
          reportSubmissionData,
          (response: any) => resolve(response),
          (error: any) => reject(error),
        );
      });

      Toast.info('Report submitted successfully.');
      resetForm();
      history.push(localRoutes.reports);
    } catch (error) {
      console.error('Submission failed:', error);
      const errorMessage = (error as any)?.response?.data?.message
        || 'Failed to submit report. Please check your network connection.';
      Toast.error(errorMessage);
    }
  };

  function getFieldComponent(
    fieldI: IReportField,
    formDataI: any,
    handleChangeI: any,
  ) {
    const {
      name, label, type, hidden,
    } = fieldI;
    const value = formDataI[name] || '';
    const options = fieldI.options ? toOptions(fieldI.options) : [];
    const hasError = !!validationErrors[name];

    if (name === 'smallGroupName') {
      return (
        <XRemoteSelect
          remote={remoteRoutes.groupsCombo}
          filter={{ 'categories[]': 'Missional Community' }}
          parser={({ name, id }: any) => ({ name, id })}
          name={name}
          label={label}
          variant="outlined"
          customOnChange={(value: string) => handleSmallGroupChange(name, value)
          }
          margin="none"
        />
      );
    }

    switch (type) {
      case 'text':
        return (
          // eslint-disable-next-line
          <XTextInput
            id={name}
            name={name}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeI(name, e.target.value)
            }
            label={label}
            variant="outlined"
            margin="none"
            isHidden={hidden}
            type="text"
            required={fieldI.required}
            error={hasError}
            helperText={validationErrors[name]}
          />
        );
      case 'date':
        return (
          // eslint-disable-next-line
          <XDateInput
            id={name}
            name={name}
            value={value}
            onChange={(value: MaterialUiPickersDate) => handleChangeI(name, value)
            }
            label={label}
            variant="outlined"
            margin="none"
            required={fieldI.required}
            error={hasError}
            helperText={validationErrors[name]}
          />
        );
      case 'radio':
        return (
          // eslint-disable-next-line
          <XRadioInput
            name={name}
            customOnChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeI(name, e.target.value)
            }
            label={label}
            options={options}
            required={fieldI.required}
          />
        );
      case 'select':
        return (
          // eslint-disable-next-line
          <XSelectInput
            name={name}
            label={label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeI(name, e.target.value)
            }
            options={options}
            required={fieldI.required}
          />
        );
      case 'textarea':
        return (
          // eslint-disable-next-line
          <XTextAreaInput
            id={name}
            name={name}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeI(name, e.target.value)
            }
            label={label}
            variant="outlined"
            margin="none"
            error={hasError}
            helperText={validationErrors[name]}
          />
        );
      case 'number':
        return (
          // eslint-disable-next-line
          <XTextInput
            id={name}
            name={name}
            required={false}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeI(name, e.target.value)
            }
            label={label}
            variant="outlined"
            margin="none"
            isHidden={hidden}
            type="number"
            error={hasError}
            helperText={validationErrors[name]}
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
    <Layout title={reportName}>
      <ToastContainer />
      <XForm onSubmit={handleSubmit} submitButtonAlignment="left">
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
/* eslint-disable linebreak-style */
