import React from 'react';
import Grid from "@material-ui/core/Grid";
import GridWrapper from "./GridWrapper";
import {Typography} from "@material-ui/core";

interface IProps {
    text: any
}

const Error = (props: IProps) => {
    return (
        <GridWrapper>
            <Grid container spacing={10} justify='center' alignItems="center">
                <Grid item>
                    <Typography color='error' variant='h5'>{props.text}</Typography>
                </Grid>
            </Grid>
        </GridWrapper>
    );
}
export default Error;
