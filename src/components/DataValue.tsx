import React from 'react';
import {Typography} from "@material-ui/core";



const DataValue = (props: any) => {
    return (
        <Typography variant='body1' component='div'>
            {props.children}
        </Typography>
    );
}


export default DataValue;
