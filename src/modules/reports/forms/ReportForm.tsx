import React, { useCallback, useEffect, useState } from "react";
import * as yup from "yup";
import { reqDate, reqObject, reqString } from "../../../data/validations";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../components/forms/XForm";
import XTextInput from "../../../components/inputs/XTextInput";
import { remoteRoutes } from "../../../data/constants";
import { XRemoteSelect } from "../../../components/inputs/XRemoteSelect";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import { cleanComboValue } from "../../../utils/dataHelpers";
import { parseGooglePlace } from "../../../components/plain-inputs/PMapsInput";
import { Box, Divider, Typography } from "@material-ui/core";
import XDateInput from "../../../components/inputs/XDateInput";
import { XMapsInput } from "../../../components/inputs/XMapsInput";
import { IReport } from "../types";
import XTextAreaInput from "../../../components/inputs/XTextAreaInput";

interface IProps {
  data?: Partial<IReport>;
  isNew: boolean;
  groupId?: string;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  onDeleted?: (g: any) => any;
  onCancel?: () => any;
}

const schema = yup.object().shape({
  category: reqObject,
  name: reqString,

  venue: reqObject,
  group: reqObject,

  startDate: reqDate
});

const initialData = {
  name: "",
  category: null,

  venue: null,
  group: null,

  startDate: new Date(),
  metaData: null
};

const ReportForm = ({
  data,
  isNew,
  onCreated,
  onUpdated,
  onDeleted,
  onCancel
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [reportType, setReportType] = useState(false);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
     const toSave: any = {
      id: values.id,
      name: values.name,
      details: values.details,
      categoryId: cleanComboValue(values.category),

      startDate: "2021-02-23T11:06:07.926Z",

      venue: parseGooglePlace(values.venue),
      groupId: cleanComboValue(values.group)
    };

    const submission: ISubmission = {
      url: remoteRoutes.reports,
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
    
  }

  const fn_reportType = (value:any) =>{
    value === "MC Report" ? setReportType(true):setReportType(false);
  };

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
        <Grid item xs={12} md={6}>
          <XRemoteSelect
            remote={remoteRoutes.reportsCategories}
            name="category"
            label="Category"
            variant="outlined"
            customOnChange={fn_reportType}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XDateInput
            name="startDate"
            label="Date"
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
            label="Report name"
            type="text"
            variant="outlined"
          />
        </Grid>
       {/* {reportType &&  ( */}
         <Grid spacing={1} container>
            <Grid item xs={12}>
              <XMapsInput
                name="venue"
                label="Venue"
                variant="outlined"
                placeholder="Type to search"
              />
            </Grid>
            <Grid item xs={12}>
              <Box pt={2}>
                <Typography variant="button" display="block">Attendance</Typography>
              </Box>
              <Divider/>
            </Grid>
            <Grid item xs={12}>
                <Box pt={2}>
                  <Typography variant="button" display="block">Highlights</Typography>
                </Box>
                <Divider />
            </Grid>
            <Grid item xs={12} md={6}>
              <XTextAreaInput
                name="learningPoints"
                label="Learning Points"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <XTextAreaInput
                name="actionPoints"
                label="Action Points"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
                <Box pt={2}>
                  <Typography variant="button" display="block">Testimonies</Typography>
                </Box>
                <Divider />
            </Grid>
            <Grid item xs={12}>
              <XTextAreaInput
                name="testimonies"
                label="Testimonies"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
                <Box pt={2}>
                  <Typography variant="button" display="block">Prayer Requests</Typography>
                </Box>
                <Divider />
            </Grid>
            <Grid item xs={12}>
              <XTextAreaInput
                name="prayerRequests"
                label="Prayer Requests"
                variant="outlined"
              />
            </Grid>
          </Grid>
         {/* )}  */}
        
        
      </Grid>
    </XForm>
  );
};

export default ReportForm;
