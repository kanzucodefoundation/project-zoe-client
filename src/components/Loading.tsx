import React from 'react';
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import GridWrapper from "./GridWrapper";

const Loading = () => {
    return (
        <GridWrapper>
            <Grid container spacing={0} justify='center' alignItems="center" alignContent='center'>
                <CircularProgress/>
            </Grid>
        </GridWrapper>
    );
}
export default Loading;
