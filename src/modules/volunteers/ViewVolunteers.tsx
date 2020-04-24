import React from 'react';
import * as yup from "yup";
import {reqString} from "../../data/validations";
import {ministryCategories} from "../../data/comboCategories";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XSelectInput from "../../components/inputs/XSelectInput";
import {toOptions} from "../../components/inputs/inputHelpers";
import {Box} from "@material-ui/core";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";

interface IProps {
    data: any | null
    done?: () => any
}

const schema = yup.object().shape(
    {
        ministry: reqString
    }
)

const initialValues = {
    ministry: '',
}


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        filterPaper: {
            borderRadius: 0,
            padding: theme.spacing(2)
        },
        fab: {
            position: 'absolute',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    }),
);

const ListOfVolunteers = ({done}: IProps) => {
    const classes = useStyles();

    function handleSubmit(values: any, actions: FormikHelpers<any>) {

    }

    return(
        <Navigation>
            <Box p={1} className={classes.root}>
                <Header title="View volunteers" />

                <Grid item xs={6}>
                    <XForm
                        onSubmit={handleSubmit}
                        schema={schema}
                        initialValues={initialValues}
                    >
                        <Grid spacing={0} container>
                            <Grid item xs={12}>
                                <XSelectInput
                                    name="ministry"
                                    label="Ministry"
                                    options={toOptions(ministryCategories)}
                                    variant='outlined'
                                />
                            </Grid>
                        </Grid>
                    </XForm>

                    <h4>Volunteers</h4>
                    <List>
                        {[0, 1, 2, 3].map((item) => (
                        <ListItem><ListItemText primary={`${item + 1}. Volunteer`} /></ListItem>
                        ))}
                    </List>
                </Grid>
            </Box>
        </Navigation>
    );
}

export default ListOfVolunteers;