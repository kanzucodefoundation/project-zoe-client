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
  data: any;
  isNew: boolean;
  onUpdated?: (g: any) => any;
  onCancel?: () => any;
  done: any;
}

const MemberEventActivitiesUnAssignForm = ({
  isNew,
  done,
  onUpdated,
  onCancel,
  data,
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<boolean>(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  const handleEdit = () => {
    setCreateDialog(true);
  };

  const initialValues = {
    person: members,
  };
  const handleClose = () => {
    setCreateDialog(false);
  };

  useEffect(() => {
    if (data) {
      let person: any = [];
      data.forEach((member: any) => {
        person.push({
          id: member.id,
          name: member.person,
          contactId: member.contactId,
        });
      });
      setMembers(person);
    }
  }, []);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const person: any = data.map((it: any) => it.id);
    const memberValues: any = values.person.map((it: any) => it.id);

    const unAssignedMembers = person.filter(
      (it: any) => !memberValues.includes(it)
    );
    const toSave: any = {
      memberIds: unAssignedMembers,
    };

    put(remoteRoutes.memberEventActivities, toSave, () => {
      Toast.success(" Member unassigned successfully");
      actions.resetForm();
      handleClose();
      window.location.reload();
    });
  }
  return (
    <XForm
      onSubmit={handleSubmit}
      initialValues={{ initialValues }}
      loading={loading}
      onCancel={onCancel}
    >
      <Grid spacing={1} container>
        <Grid item xs={12}>
          {console.log(members, "dialog")}
          <XComboInput
            name="person"
            label="Members"
            options={toOption(members)}
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
