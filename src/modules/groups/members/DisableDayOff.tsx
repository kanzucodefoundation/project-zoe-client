import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { useSelector } from 'react-redux';
import { Box, Typography, Button } from '@material-ui/core';
import { ISchedule } from 'tui-calendar';
import { reqDate, reqString } from '../../../data/validations';
import XForm from '../../../components/forms/XFormHC';
import XTextInput from '../../../components/inputs/XTextInput';
import { remoteRoutes, appPermissions } from '../../../data/constants';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';
import {
  del, get, post, search,
} from '../../../utils/ajax';
import Toast from '../../../utils/Toast';
import { cleanComboValue } from '../../../utils/dataHelpers';
import { parseGooglePlace } from '../../../components/plain-inputs/PMapsInput';
import { XMapsInput } from '../../../components/inputs/XMapsInput';
import { IEvent } from '../../events/types';
import XDateTimeInput from '../../../components/inputs/XDateTimeInput';
import { IState } from '../../../data/types';
import XRadioInput from '../../../components/inputs/XRadioInput';
import { responseCategories } from '../../../data/comboCategories';
import { toOptions } from '../../../components/inputs/inputHelpers';
// import EventDayOff from "../../events/details/EventDayOff";
import { hasAnyRole } from '../../../data/appRoles';

interface IProps {
  data?: any | null;
  isNew: boolean;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  onDeleted?: (g: any) => any;
  onCancel?: () => any;
  e?: any;
}

const schema = yup.object().shape({
  reason: reqString,
  startDate: reqDate,
  endDate: reqDate,
});

const initialData = {
  reason: '',
  startDate: new Date(),
  endDate: new Date(),
};

const DisableDayOff = ({
  data,
  isNew,
  e,
  onCreated,
  onUpdated,
  onDeleted,
  onCancel,
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [frequency, setFrequency] = useState('');
  const user = useSelector((state: IState) => state.core.user);
  const profile = useSelector((state: IState) => state.core.user);
  const [dialog, setDialog] = useState<boolean>(true);
  const [event, setEvent] = useState<any>();
  const [day, setDay] = useState<any>();
  const [selectDay, setSelectedDay] = useState<any>();
  const [value, setValue] = useState<any[]>([]);
  const [eventDate, setEventDate] = useState<any>();
  const [load, setLoad] = useState<boolean>(true);

  function getFrequency(event: any, group: any) {
    const filter = {
      eventCategory: event.id,
      groupCategory: group.categoryId,
    };
    search(remoteRoutes.groupReportFrequency, filter, (resp) => {
      setFrequency(resp[0].frequency);
    });
  }

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    console.log(values, 'Heyyyyy');
    const toSave: any = {
      contactId: user.contactId,
      reason: values.reason,
      startDate: values.startDate,
      endDate: values.endDate,
      eventId: values.eventId,
    };

    const submission: ISubmission = {
      url: remoteRoutes.dayOff,
      values: toSave,
      actions,
      isNew,
      onAjaxComplete: (data: any) => {
        if (isNew) {
          onCreated && onCreated(data);
        } else {
          onUpdated && onUpdated(data);
        }
        actions.resetForm();
        actions.setSubmitting(false);
      },
    };
    handleSubmission(submission);
  }

  useEffect(() => {
    setLoad(true);
    // get(remoteRoutes.dayOff, (data) => {
    //   setEvent(data);
    //   console.log(data, "hello");
    //   let myEvents: any[] = [];
    //   for (let i = 0; i < data.length; i++) {
    //     const calEvent = {
    //       category: "time",
    //       isVisible: true,
    //       id: data[i].id,
    //       body: data[i].reason,
    //       start: data[i].startDate,
    //       end: data[i].endDate,
    //     };
    //     myEvents.push(calEvent);
    //   }
    //   setDay(myEvents);
    // });
  }, [dialog]);

  const handleDelete = () => {
    setLoading(true);
    del(
      `${remoteRoutes.dayOff}/${data?.id}`,
      () => {
        Toast.success('Operation successful');
        onDeleted && onDeleted(data?.id);
      },
      undefined,
      () => {
        setLoading(false);
      },
    );
  };

  const { placeId, name } = data?.venue || {};
  const venue = data?.venue ? { placeId, description: name } : undefined;

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={{ initialData }}
      onDelete={handleDelete}
      loading={loading}
      onCancel={onCancel}
    >
      {(formData: any) => (
        <Grid spacing={1} container>
          <Grid item xs={12} md={6}>
            <XDateTimeInput
              name="startDate"
              label="Start Date"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <XDateTimeInput
              name="endDate"
              label="End Date"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <XTextInput
              name="reason"
              label="Reason"
              type="text"
              variant="outlined"
            />
          </Grid>
        </Grid>
      )}
    </XForm>
  );
};

export default DisableDayOff;
