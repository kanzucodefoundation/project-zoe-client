import React from 'react';
import { Grid } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

interface IProps {
    title?: string
}

const Header = ({ title }: IProps) => {
    return (
        <Grid container spacing={0}>
            {
                title &&
                <Grid item xs={12}>
                    <Box mb={2}>
                        <Typography variant='h6'>{title}</Typography>
                    </Box>
                </Grid>
            }
        </Grid>
    );
}


export default Header;