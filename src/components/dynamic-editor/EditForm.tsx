import React from 'react';
import {IColumn} from "./types";
import {FormikHelpers} from "formik/dist/types";
import {handleSubmission, ISubmission} from "../../utils/formHelpers";
import XForm from "../forms/XForm";
import Grid from "@material-ui/core/Grid";
import {renderInput} from "../inputs/inputHelpers";
import {del} from "../../utils/ajax";
import Toast from "../../utils/Toast";

interface IProps {
    columns: IColumn[]
    url: string
    data: any | null
    isNew: boolean
    debug?: boolean
    done?: () => any
    onNew: (data: any) => any
    onEdited: (data: any) => any
    onDeleted: (data: any) => any
    schema?: any
    primaryKey?: any
    submitParser?: (data: any) => any
    submitResponseParser?: (data: any) => any
}

const EditForm = ({
                      data,
                      isNew,
                      url, columns,
                      done,
                      debug,
                      primaryKey = 'id',
                      submitParser,
                      submitResponseParser,
                      ...props
                  }: IProps) => {

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        const toSubmit = submitParser ?
            submitParser(values) :
            values;
        const submission: ISubmission = {
            url, values: toSubmit, actions, isNew,
            onAjaxComplete: (resp: any) => {
                const saved = submitResponseParser ? submitResponseParser(resp) : resp
                isNew ? props.onNew(saved) : props.onEdited(saved);
                if (done)
                    done()
            }
        }
        handleSubmission(submission)
    }

    function handleDelete() {
        const delUrl = `${url}/${data[primaryKey]}`
        del(delUrl, resp => {
            console.log("deleted", resp)
            Toast.success("Operation succeeded")
            props.onDeleted(data)
        })
    }

    return (
        <XForm
            onSubmit={handleSubmit}
            onDelete={isNew ? undefined : handleDelete}
            schema={props.schema}
            initialValues={data}
            debug={debug}
        >
            <Grid spacing={0} container>
                {
                    columns.map(it => {
                        return <Grid item xs={12} key={it.name}>
                            {renderInput(it)}
                        </Grid>
                    })
                }
            </Grid>
        </XForm>
    );
}

export default EditForm;
