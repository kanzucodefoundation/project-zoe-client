import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { useDispatch } from 'react-redux';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import { remoteRoutes } from '../../data/constants';
import { crmConstants } from '../../data/contacts/reducer';
import { post } from '../../utils/ajax';
import Toast from '../../utils/Toast';
import { ICreatePersonDto } from '../contacts/types';
import { IReportColumn } from './types';

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
    const toSave: ICreatePersonDto = {
      reportId,
      ...values,
    };

    post(
      remoteRoutes.reports,
      toSave,
      (data) => {
        Toast.info('Report submitted successfully');
        dispatch({
          type: crmConstants.crmAddAddress,
          payload: { ...data },
        });
      },
      undefined,
      () => {
        // handle error or complete state updates
      },
    );
  };

  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={formData}
    >
      <Grid container spacing={2}>
        {fields.map((field) => (
            <Grid item xs={12} md={8}>
            <XTextInput
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                label={field.label}
                variant="outlined"
                margin="none"
            />
            </Grid>
        ))}
      </Grid>
    </XForm>
  );
};

export default ReportForm;
