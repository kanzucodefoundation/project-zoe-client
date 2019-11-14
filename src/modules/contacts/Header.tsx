import React from 'react';
import {Grid} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import XSearchInput from "../../components/inputs/XSearchInput";
import Hidden from "@material-ui/core/Hidden";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";

interface IProps {
    onAddNew: () => any
    onFilterToggle: () => any
}

const Header = ({onAddNew, onFilterToggle}: IProps) => {
    return (
        <Grid container spacing={0}>
            <Grid item xs={12}>
                <Box mb={2}>
                    <Typography variant='h5'>Contacts</Typography>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box mb={2} display="flex">
                    <Box width="100%">
                        <XSearchInput onFilterToggle={onFilterToggle}/>
                    </Box>
                    <Hidden xsDown>
                        <Box flexShrink={0} pt={1} ml={1}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<AddIcon/>}
                                onClick={onAddNew}
                            >
                                Add New
                            </Button>
                        </Box>
                    </Hidden>
                </Box>
            </Grid>
        </Grid>
    );
}


export default Header;
