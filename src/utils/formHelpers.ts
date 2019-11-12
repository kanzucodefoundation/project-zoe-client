import {handleError, post, put} from "./ajax";
import Toast from "./Toast";
import {FormikActions} from "formik";

export interface ISubmission {
    url: string
    values: any
    isNew: boolean
    actions: FormikActions<any>
    onAjaxComplete?: (data: any) => any
}

export function handleSubmission(submission: ISubmission) {
    const {isNew, actions, values, onAjaxComplete, url} = submission
    if (isNew) {
        post(url, values,
            (data) => {
                Toast.info('Operation successful')
                actions.resetForm()
                onAjaxComplete && onAjaxComplete(data)
            },
            (err, resp) => {
                handleError(err, resp)
            }, () => {
                actions.setSubmitting(false);
            }
        )
    } else {
        put(url, values,
            (data) => {
                Toast.info('Update successful')
                actions.resetForm()
                onAjaxComplete && onAjaxComplete(data)
            },
            (err, resp) => {
                handleError(err, resp)
            }, () => {
                actions.setSubmitting(false);
            }
        )
    }
}
