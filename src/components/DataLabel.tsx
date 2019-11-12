import React from 'react';
import {Typography} from "@material-ui/core";

interface IProps {
    children?: React.ReactNode
    noColon?: boolean
}

const DataLabel = (props: IProps) => {
    return (
        <Typography variant='body2' noWrap component='div'>
            {props.children} {props.noColon ? '' : ':'}
        </Typography>
    );
}


export default DataLabel;
