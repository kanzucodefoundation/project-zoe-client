import React, { SyntheticEvent } from "react";
import Avatar from "@material-ui/core/Avatar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useLoginStyles } from "./loginStyles";
import Link from "@material-ui/core/Link";
import { localRoutes } from "../../data/constants";
import { useHistory } from "react-router";
import DoneAllIcon from "@material-ui/icons/DoneAll";

function UpdatePasswordConfirmation() {

    const classes = useLoginStyles();
    const history = useHistory();

    function handleUpdatePassword(e: SyntheticEvent<any>) {
        e.preventDefault()
        history.push(localRoutes.login);
    }

    return (
        <main className={classes.main}>
            <CssBaseline/>
            <Paper className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <DoneAllIcon/>
                </Avatar>
                <Typography component="h1">
                    Password Updated
                </Typography>
                <Typography component="p">
                    <b>
                        Your password has been successfully updated. Go back to the
                        login page to log into your account.
                    </b>
                </Typography>
                <Link
                    className={classes.link}
                    onClick={handleUpdatePassword}
                >
                    Go To Login Page
                </Link>

            </Paper>
        </main>
    )
}

export default UpdatePasswordConfirmation





