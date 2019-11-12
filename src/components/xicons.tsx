import React from "react";
import WatchLaterIcon from "@material-ui/icons/WatchLater";
import MUIErrorIcon from "@material-ui/icons/Error";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {errorColor, successColor, warningColor} from "../theme/custom-colors";


export function SuccessIcon({completed, active,error, ...props}: any) {
    return (
        <CheckCircleIcon {...props} style={{color: successColor}}/>
    );
}

export function ErrorIcon({completed, active,error, ...props}: any) {
    return (
        <MUIErrorIcon {...props} style={{color: errorColor}}/>
    );
}

export function WarningIcon({completed, active,error, ...props}: any) {
    return (
        <WatchLaterIcon {...props} style={{color: warningColor}}/>
    );
}
