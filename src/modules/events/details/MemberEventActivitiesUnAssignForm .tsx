import React, { useCallback, useEffect, useState } from "react";

import { remoteRoutes } from "../../../data/constants";
import XForm from "../../../components/forms/XForm";
import { FormikHelpers } from "formik";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import { toOptions } from "../../../components/inputs/inputHelpers";
import XSelectInput from "../../../components/inputs/XSelectInput";

import { Grid } from "@material-ui/core";
import { get, search } from "../../../utils/ajax";

interface IProps {
  data: any ;
  isNew: boolean;
  onUpdated?: (g: any) => any;
  onCancel?: (g: any) => any;
  done: any;
}

const initialValues = {
  contact:[],

};



const MemberEventActivitiesUnAssignForm = ({
  isNew, done, onUpdated,onCancel,
 
}: IProps) => {
  //console.log(data.person, "###");
  const [loading, setLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [data, setData] = useState<any[]>([]);
  
  console.log(data, "###");
  const handleEdit = () => {
   setCreateDialog(true);
  };

  
  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.memberEventActivities}`,
      
      (data) => {
        console.log(data, "###data");
        setData(data);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }, [createDialog]);
 
  
  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      ...values,
    }
    const submission: ISubmission = {
      url: remoteRoutes.memberEventActivities,
      values: toSave,
      actions,
      isNew: false,
      onAjaxComplete: done,
    };
    handleSubmission(submission);
  }


  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={data}
      loading={loading}
      onCancel={done}
    >
      <Grid spacing={1} container>
        <Grid item xs={12}>
          <XSelectInput
            name="name"
            label="Members"
            options={toOptions(data)}
            variant="outlined"
            margin="none"
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default MemberEventActivitiesUnAssignForm;
