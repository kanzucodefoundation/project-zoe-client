import React from 'react';
import * as yup from "yup";
import { reqString } from "../../data/validations";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import { toOptions } from "../../components/inputs/inputHelpers";
import { remoteRoutes } from "../../data/constants";
import { ministryCategories } from "../../data/comboCategories";
import { handleSubmission, ISubmission } from "../../utils/formHelpers";
import { IOption } from "../../components/inputs/inputHelpers";
import { useDispatch } from "react-redux";
import { servicesConstants } from "../../data/tasks/reducer";
import { post } from "../../utils/ajax";
import Toast from "../../utils/Toast";
interface IProps {
    data: any
    isNew: boolean
    done: (dt: any) => any
}

const schema = yup.object().shape(
    {
        ministry: reqString,
        taskName: reqString,
        taskDescription: reqString
    }
)

const schemaNew = yup.object().shape(
    {
        ministry: reqString,
        taskName: reqString,
        taskDescription: reqString  
    }
)

const TaskEditor = ({ data, isNew, done }: IProps) => {
    const dispatch = useDispatch();
    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSave: any = {
            id: values.id,
            ministry: values.ministry,
            taskName: values.taskName,
            taskDescription: values.taskDescription,
        }
    post(
        remoteRoutes.tasks,
        toSave,
        (data) => {
            Toast.info("Edit Task Succesfull!");
            actions.resetForm();
            dispatch({
                type: servicesConstants.servicesAddTask,
                payload: { ...data },
            });
        },
        undefined,
        () => {
            actions.setSubmitting(false);
        }
    );
}
    return (
        <XForm
            onSubmit={handleSubmit}
            schema={isNew ? schemaNew : schema}
            initialValues={data}
        >
            <Grid spacing={1} container>
                
                <Grid item xs={12}>
                    <XSelectInput
                        name="ministry"
                        label="Ministry"
                        options={toOptions(ministryCategories)}
                        variant="outlined"
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="taskName"
                        label="taskName"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="taskDescription"
                        label="taskDescription"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
            </Grid>
        </XForm>
    );
}


export default TaskEditor;