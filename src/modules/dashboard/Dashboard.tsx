import React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Layout from "../../components/Layout";
import {Grid} from "@material-ui/core";
import ContactItem from "../contacts/ContactItem";
import {createArray} from "../../utils/arrayHelpers";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import XSearchInput from "../../components/inputs/XSearchInput";
import Button from '@material-ui/core/Button';
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Hidden from "@material-ui/core/Hidden";
import {fakeContact} from "../contacts/types";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        fab: {
            position: 'absolute',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    }),
);

export default function SimpleSelect() {
    const classes = useStyles();


    const list = createArray<number>(10, () => 0)

    function handleNew() {

    }

    function handleToggleFilter() {

    }

    function handleGridToggle() {

    }

    return (
        <Layout>
            <Box p={2}>

                <Grid container spacing={1}>
                    {
                        list.map((it, index) =>
                            <Grid item xs={12} sm={6} md={4} xl={3} key={index}>
                                <ContactItem data={fakeContact()}/>
                            </Grid>
                        )
                    }
                </Grid>
            </Box>

            <Hidden smUp>
                <Fab aria-label='add-new' className={classes.fab} color='primary' onClick={handleNew}>
                    <AddIcon/>
                </Fab>
            </Hidden>

        </Layout>
    );
}
