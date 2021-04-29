import React, { useState } from "react";
import * as yup from "yup";
import { reqString } from "../../../data/validations";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XTextInput from "../../../components/inputs/XTextInput";
import { remoteRoutes } from "../../../data/constants";
import { handleSubmission, ISubmission } from "../../../utils/formHelpers";
import { del } from "../../../utils/ajax";
import Toast from "../../../utils/Toast";
import { IEventCategory } from "../types";
import XForm from "../../../components/forms/XForm";

interface IProps {
  data?: Partial<IEventCategory>;
  isNew: boolean;
  onCreated?: (g: any) => any;
  onUpdated?: (g: any) => any;
  onDeleted?: (g: any) => any;
  onCancel?: () => any;
}

const schema = yup.object().shape({
  name: reqString,
});

const initialData = {
  name: "",
};

const EventCategoryForm = ({
  data,
  isNew,
  onCreated,
  onUpdated,
  onDeleted,
  onCancel,
}: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      name: values.name
    };

    const submission: ISubmission = {
      url: remoteRoutes.eventsCategories,
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

  function handleDelete() {
    setLoading(true);
    del(
      `${remoteRoutes.eventsCategories}/${data?.id}`,
      () => {
        Toast.success("Event Category successfully added");
        onDeleted && onDeleted(data?.id);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={{ ...initialData, ...data}}
      onDelete={handleDelete}
      loading={loading}
      onCancel={onCancel}
    >
        <Grid spacing={1} container>
<Grid item xs={12}>
                <XTextInput
                    name="name"
                    label="Category Name"
                    type="text"
                    variant="outlined"
                />
            </Grid>
        </Grid>
    </XForm>
  );
};

export default EventCategoryForm;
