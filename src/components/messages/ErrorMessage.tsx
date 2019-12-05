import React from 'react';
import {Box, colors, Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

interface IProps {
    text: string
}

const ErrorMessage = (props: IProps) => {
    return (
        <Box display="flex" p={4} justifyContent="center">
            <Paper style={{backgroundColor: colors.red[100]}} elevation={0}>
                <Box p={3}>
                    <Typography>{props.text}&nbsp;!</Typography>
                </Box>
            </Paper>
        </Box>
    );
}


export default ErrorMessage;
