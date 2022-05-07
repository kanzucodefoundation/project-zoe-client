import React, { useEffect, useState } from 'react';
import { Alert } from '@material-ui/lab';
import { remoteRoutes } from '../../../data/constants';
import FormFields from '../../../components/forms/FormFields';
import { get } from '../../../utils/ajax';
import { hasNoValue, hasValue } from '../../../components/inputs/inputHelpers';

interface IProps {
  eventCategory: string;
}

const EventMetadataForm = ({ eventCategory }: IProps) => {
  const [fields, setFields] = useState<any[]>([]);
  useEffect(() => {
    if (hasValue(eventCategory)) {
      get(`${remoteRoutes.eventsCategories}/${eventCategory}`, (resp) => {
        setFields(resp.fields);
      });
    }
  }, [eventCategory]);

  if (hasNoValue(fields)) return <Alert severity="info">Select a category for more options</Alert>;
  return <FormFields fields={fields} spacing={2} parentField="metaData" />;
};

export default EventMetadataForm;
