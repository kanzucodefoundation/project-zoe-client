import React, { useState } from "react";
import * as yup from "yup";
import { reqDate, reqObject, reqString } from "../../../data/validations";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../components/forms/XForm";
import XTextInput from "../../../components/inputs/XTextInput";
import { remoteRoutes } from "../../../data/constants";
import { GroupPrivacy } from "../../groups/types";
import XSelectInput from "../../../components/inputs/XSelectInput";
import { toOptions } from "../../../components/inputs/inputHelpers";
import { enumToArray } from "../../../utils/stringHelpers";
import { XRemoteSelect } from "../../../components/inputs/XRemoteSelect";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import { del } from "../../../utils/ajax";
import Toast from "../../../utils/Toast";
import { cleanComboValue } from "../../../utils/dataHelpers";
import { parseGooglePlace } from "../../../components/plain-inputs/PMapsInput";
import { XMapsInput } from "../../../components/inputs/XMapsInput";
import { IEvent } from "../types";
import XDateTimeInput from "../../../components/inputs/XDateTimeInput";
import { useSelector } from "react-redux";
import { IState } from "../../../data/types";

interface IProps {
  data?: Partial<IEvent>;
  isNew: boolean;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  onDeleted?: (g: any) => any;
  onCancel?: () => any;
}

const schema = yup.object().shape({
  privacy: reqString,
  category: reqObject,
  name: reqString,
  details: reqString,

  venue: reqObject,
  group: reqObject,

  startDate: reqDate,
  endDate: reqDate
});

const initialData = {
  name: "",
  privacy: GroupPrivacy.Public,
  category: null,
  details: "",

  venue: null,
  group: null,

  startDate: new Date(),
  endDate: new Date(),
  metaData: null
};

const EventForm = ({
  data,
  isNew,
  onCreated,
  onUpdated,
  onDeleted,
  onCancel
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const user = useSelector((state: IState) => state.core.user);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      id: values.id,
      name: values.name,
      details: values.details,
      privacy: values.privacy,
      categoryId: cleanComboValue(values.category),
      parentId: values.group.parentId,

      startDate: values.startDate,
      endDate: values.endDate, 

      submittedAt: new Date(),
      submittedBy: user.contactId,

      venue: parseGooglePlace(values.venue),
      groupId: cleanComboValue(values.group)
    };

    const submission: ISubmission = {
      url: remoteRoutes.events,
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
      }
    };
    handleSubmission(submission);
  }

  function handleDelete() {
    setLoading(true);
    del(
      `${remoteRoutes.events}/${data?.id}`,
      () => {
        Toast.success("Operation succeeded");
        onDeleted && onDeleted(data?.id);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }

  const { placeId, name } = data?.venue || {};
  const venue = data?.venue ? { placeId, description: name } : undefined;

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={{ ...initialData, ...data, venue }}
      onDelete={handleDelete}
      loading={loading}
      onCancel={onCancel}
    >
      <Grid spacing={1} container>
        <Grid item xs={4}>
          <XSelectInput
            name="privacy"
            label="Privacy"
            options={toOptions(enumToArray(GroupPrivacy))}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={8}>
          <XRemoteSelect
            remote={remoteRoutes.eventsCategories}
            name="category"
            label="Category"
            variant="outlined"
          />
        </Grid>
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
          <XRemoteSelect
            remote={remoteRoutes.groupsCombo}
            name="group"
            label="Group"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <XTextInput
            name="name"
            label="Event name"
            type="text"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <XMapsInput
            name="venue"
            label="Venue"
            variant="outlined"
            placeholder="Type to search"
          />
        </Grid>
        <Grid item xs={12}>
          <XTextInput
            name="details"
            label="Details"
            variant="outlined"
            multiline
            rowsMax="3"
            rows={3}
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default EventForm;
