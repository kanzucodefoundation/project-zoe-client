import React from 'react';
import {Box} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";


interface IProps {
    width?: any
    children?: any
}


const CenteredDiv = ({children, width = 500}: IProps) => {

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('xs'));
    return (
        <Box display='flex' justifyContent='center'>
            <Box
                style={
                    {
                        width: isXs ? "100%" : width,
                        maxWidth: '100%',
                    }
                }
            >{children}</Box>
        </Box>
    );
}


export default CenteredDiv;
