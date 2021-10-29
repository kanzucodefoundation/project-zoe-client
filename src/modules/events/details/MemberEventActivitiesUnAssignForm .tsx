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





const MemberEventActivitiesUnAssignForm = ({
  isNew, done, onUpdated,onCancel,data,
 
}: IProps) => {
  //console.log(data.person, "###");
  const [loading, setLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  
  console.log(members, "###");
  const handleEdit = () => {
   setCreateDialog(true);
  };

  const initialValues = {
    members:data,
  
  };
  useEffect(() => {
    if (data){
      let person:any= []
      data.forEach((member:any) => {
       
        person.push({id:member.contactId,name:member.person})
        console.log(member, "### members and contact");
      })
      setMembers(person)
    }
  }, []);
 
  
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
    handleSubmission(submission)

  }
  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={{initialValues }}
      loading={loading}
      onCancel={done}
    >
      <Grid spacing={1} container>
        <Grid item xs={12}>
          {console.log(members,"dialog")}
          <XSelectInput
            name="person"
            label="Members"
            options={toOptions(members)}
            variant="outlined"
            margin="none"
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default MemberEventActivitiesUnAssignForm;
