import React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Layout from "../../components/layout/Layout";
import {Grid} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {useSelector} from "react-redux";
import {IState} from "../../data/types";
import Widget from "./Widget";
import Box from "@material-ui/core/Box";
import Money from '@material-ui/icons/Money';
import Info from '@material-ui/icons/Info';
import People from '@material-ui/icons/People';
import {printMoney,printInteger} from "../../utils/numberHelpers";
import UsersByDevice from "./UsersByDevice";

const data = [
    {
        title: "Giving",
        value: printMoney(20088766),
        percentage: -6,
        icon: Money
    },
    {
        title: "Attendance",
        value: printInteger(2567),
        percentage: 4,
        icon: Info
    },
    {
        title: "MCs",
        value: 256,
        percentage: 1,
        icon: People
    },
    {
        title: "Salvation",
        value: 45,
        percentage: 2,
        icon: People
    }
]

export default function SimpleSelect() {
    const profile = useSelector((state: IState) => state.core.user)

    return (
        <Layout>
            <Box p={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='overline' component='div'>Dashboard</Typography>
                        <Typography variant='caption' component='div'>Here's what's happening</Typography>
                    </Grid>
                    {
                        data.map(it => <Grid item xs={12} sm={6} md={4} lg={3} key={it.title}>
                            <Widget {...it}/>
                        </Grid>)
                    }
                    <Grid item xs={12} md={6} >
                        <UsersByDevice/>
                    </Grid>
                    <Grid item xs={12} md={6} >
                        <UsersByDevice/>
                    </Grid>
                </Grid>
            </Box>

        </Layout>
    );
}
