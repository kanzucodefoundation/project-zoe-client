import React from "react";
import {createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {errorColor, successColor, warningColor} from "../theme/custom-colors";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        error: {
            color: 'white',
            backgroundColor: errorColor,
            padding: 3,
            borderRadius: 3,
        },
        warning: {
            color: 'white',
            backgroundColor: warningColor,
            padding: 3,
            borderRadius: 3
        },
        success: {
            color: 'white',
            backgroundColor: successColor,
            padding: 3,
            borderRadius: 3
        }
    }),
);


export const ErrorLabel = (props: any) => {
    const classes = useStyles()
    return <Typography variant='caption' className={classes.error}>{props.children}</Typography>
}

export const WarnLabel = (props: any) => {
    const classes = useStyles()
    return <Typography variant='caption' className={classes.warning}>{props.children}</Typography>
}

export const SuccessLabel = (props: any) => {
    const classes = useStyles()
    return <Typography variant='caption' className={classes.success}>{props.children}</Typography>
}

export const Flex = (props: any) => {
    return <div style={{display: 'flex', flexDirection: 'row'}}>
        {props.children}
    </div>
}


