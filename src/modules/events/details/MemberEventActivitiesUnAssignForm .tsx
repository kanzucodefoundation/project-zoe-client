import React, { useCallback, useEffect, useState } from "react";

import { remoteRoutes } from "../../../data/constants";
import XForm from "../../../components/forms/XForm";
import { FormikHelpers } from "formik";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import { toOption } from "../../../components/inputs/inputHelpers";
import XSelectInput from "../../../components/inputs/XSelectInput";

import { Grid } from "@material-ui/core";
import { get, post, put, search } from "../../../utils/ajax";
import XComboInput from "../../../components/inputs/XComboInput";
import Toast from "../../../utils/Toast";
import { id } from "date-fns/locale";


interface IProps {
  data: any ;
  isNew: boolean;
  onUpdated?: (g: any) => any;
  onCancel?: () => any;
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
  
  console.log(members, "###new");
  const handleEdit = () => {
    // for(let i= 0;i <members.length;i++){
    //   if(members[i]){
    //     members.push(members[i]);
    //   }
      
    // }
    
   setCreateDialog(true);
  };

 
  const initialValues = {
    person:members,
   
  };
  const handleClose = () => {
    setCreateDialog(false);
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
    console.log(values, "### values")
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
    const person:any = members.map((it:any) => it.contactId);
    const memberValues:any = values[0].map((it:any) => it.contactId) ;
    const result = person.filter((it:any)=> !memberValues.includes(it));
    console.log(result, "### values")
    // put(remoteRoutes.memberEventActivities, toSave, () => {
      
    //   Toast.success(" Member unassigned successfully");
    //   handleClose();
    //   actions.resetForm();
    //   window.location.reload();
    // });

  }
  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={{initialValues }}
      loading={loading}
      onCancel={onCancel}
    >
      <Grid spacing={1} container>
        <Grid item xs={12}>
          {console.log(members,"dialog")}
          <XComboInput
            name="person"
            label="Members"
            options={toOption(members)}
            //options={members}
            variant="outlined"
            margin="none"
            multiple
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default MemberEventActivitiesUnAssignForm;
