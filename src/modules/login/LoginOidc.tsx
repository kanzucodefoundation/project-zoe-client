import React from 'react';
import {Button} from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import LockIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {FormikActions} from 'formik';
import {useDispatch} from 'react-redux'
import {handleLogin} from "../../data/coreActions";

import * as yup from "yup";
import {post} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import Toast from "../../utils/Toast";
import userManager from "../../data/auth/userManager";
import {useLoginStyles} from "./loginStyles";

function Login() {
    const classes = useLoginStyles();
    const dispatch = useDispatch();
    const onSubmit = (data: any, actions: FormikActions<any>) => {
        post(remoteRoutes.login, data, resp => {
            dispatch(handleLogin(resp))
        }, () => {
            Toast.error("Invalid username/password")
        }, () => {
            actions.setSubmitting(false)
        })
    }

    return (
        <main className={classes.main}>
            <CssBaseline/>
            <Paper className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockIcon/>
                </Avatar>
                <Typography component="h1">
                    Sign in
                </Typography>
                <form className={classes.form}>
                    <Button
                        onClick={(event)=> {
                            event.preventDefault();
                            userManager.signinRedirect();
                        }}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Sign in
                    </Button>
                </form>
            </Paper>
        </main>
    );
}


export const schema = yup.object().shape(
    {
        email: yup.string().email('Invalid email').required("Email is required"),
        password: yup.string().required("Password is required")
    }
);

export default Login


