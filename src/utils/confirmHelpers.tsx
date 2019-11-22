import React from 'react';
import {createConfirmation, ReactConfirmProps} from 'react-confirm'
import LoaderDialog from "../components/LoaderDialog";


const ConfirmDialog = (props: ReactConfirmProps) => {
    return (
        <LoaderDialog open={props.show} onClose={props.dismiss}/>
    );
}

const defaultConfirmation = createConfirmation(ConfirmDialog);

export function confirm(confirmation: any, options: any = {}) {
    return defaultConfirmation({confirmation, ...options});
}

export function askConfirmation(message: string, callback: () => any) {
    return confirm(message)
        .then(() => {
            callback()
        })
        .catch(e => console.log("confirmation denied"))
}


export default ConfirmDialog;

