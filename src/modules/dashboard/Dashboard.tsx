import React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Layout from "../../components/layout/Layout";
import {Grid} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {useSelector} from "react-redux";
import {IState} from "../../data/types";
import Widget from "./Widget";
import Box from "@material-ui/core/Box";

export default function SimpleSelect() {
    const profile = useSelector((state: IState) => state.core.user)
    const data = [1, 2, 3, 4]
    return (
        <Layout>
            <Box p={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='overline'>Dashboard</Typography>
                        <Typography variant='h6'>Hello {profile.fullName}</Typography>
                        <Typography variant='caption'>Here's what's happening</Typography>
                    </Grid>
                    {
                        data.map(it => <Grid item xs={12} sm={6} md={4} lg={3} key={it}>
                            <Widget/>
                        </Grid>)
                    }

                </Grid>
            </Box>

        </Layout>
    );
}
