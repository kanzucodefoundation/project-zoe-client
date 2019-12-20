import * as React from "react";
import Navigation from "../../components/layout/Layout";
import Grid from '@material-ui/core/Grid';
import {remoteRoutes} from "../../data/constants";
import {Button} from "@material-ui/core";
import {post} from "../../utils/ajax";
import {fakeContact} from "../contacts/types";
import Tags from "./tags/Tags";
import PasswordReset from "./PasswordReset";
import CenteredDiv from "../../components/CenteredDiv";
import Divider from "@material-ui/core/Divider";

const Settings = () => {
    function handleFakeContact() {
        post(remoteRoutes.contacts, fakeContact(), resp => {
            console.log('Contatc created', resp)
        })
    }

    return <Navigation>
        <Grid spacing={2} container>
            <Grid item xs={12} md={6} xl={4}>
                <Tags/>
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
                <PasswordReset/>
            </Grid>
            <Grid item xs={12}>
               <Divider/>
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
                <Button onBlur={handleFakeContact} variant='contained'>Fake Contact</Button>
            </Grid>
            <Grid item xs={12} md={6} xl={3}>

            </Grid>
        </Grid>
    </Navigation>
}

export default Settings
