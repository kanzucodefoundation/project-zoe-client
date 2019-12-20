import React from 'react';
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import {Divider} from "@material-ui/core";

interface IProps {
    title: string
}

const XHeader = (props: IProps) => {
    return (
        <div>
            <Box p={2}>
                <Typography variant='h6'>{props.title}</Typography>
            </Box>
            <Divider/>
        </div>
    );
}

export default XHeader;
