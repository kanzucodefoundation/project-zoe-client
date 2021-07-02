import React from "react";
import * as yup from "yup";
import { reqString } from "../../../../data/validations";
import { addressCategories } from "../../../../data/comboCategories";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../../../components/forms/XForm";
import XSelectInput from "../../../../components/inputs/XSelectInput";
import { toOptions } from "../../../../components/inputs/inputHelpers";
import XCheckBoxInput from "../../../../components/inputs/XCheckBoxInput";
import { IAddress } from "../../types";
import { remoteRoutes } from "../../../../data/constants";
import { useDispatch } from "react-redux";
import { crmConstants } from "../../../../data/contacts/reducer";
import { handleSubmission, ISubmission } from "../../../../utils/formHelpers";
import { useDelete } from "../../../../data/hooks/useDelete";
import { XMapsInput } from "../../../../components/inputs/XMapsInput";

interface IProps {
  contactId: string;
  data: IAddress | null;
  isNew: boolean;
  done?: () => any;
}

const schema = yup.object().shape({
  category: reqString.oneOf(addressCategories),
  freeForm: reqString,
});

const AddressEditor = ({ data, isNew, contactId, done }: IProps) => {
  const dispatch = useDispatch();

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    !values.isPrimary && (values.isPrimary = false);
    const { freeForm } = values;
    values.freeForm = freeForm.description;
    values.placeId = freeForm.place_id;
    const submission: ISubmission = {
      url: remoteRoutes.contactsAddress,
      values: { ...values, contactId },
      actions,
      isNew,
      onAjaxComplete: (data: any) => {
        dispatch({
          type: isNew
            ? crmConstants.crmAddAddress
            : crmConstants.crmEditAddress,
          payload: { ...data },
        });
        if (done) done();
      },
    };
    handleSubmission(submission);
  }

  const deleteActions = useDelete({
    url: `${remoteRoutes.contactsAddress}/${data?.id}`,
    onDone: done,
    id: data?.id!,
    action: crmConstants.crmDeleteEmail,
  });

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={data}
      loading={deleteActions.loading}
      onDelete={deleteActions.handleDelete}
      onCancel={done}
    >
      <Grid spacing={0} container>
        <Grid item xs={12}>
          <XSelectInput
            name="category"
            label="Category"
            options={toOptions(addressCategories)}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <XMapsInput
            name="freeForm"
            label="Address"
            variant="outlined"
            margin="none"
            placeholder="Type to search"
          />
        </Grid>
        <Grid item xs={12}>
          <XCheckBoxInput name="isPrimary" label="Primary/Default" />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default AddressEditor;
