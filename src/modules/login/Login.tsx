import React from 'react';
import {Button} from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import LockIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {Form, Formik, FormikActions} from 'formik';
import {useDispatch} from 'react-redux'
import {handleLogin} from "../../data/coreActions";

import * as yup from "yup";
import {post} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import Toast from "../../utils/Toast";
import XTextInput from "../../components/inputs/XTextInput";
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
                <Formik
                    initialValues={{
                        "username": "ekastimo@gmail.com",
                        "password": "Xpass@123"
                    }}
                    validationSchema={schema}
                    onSubmit={onSubmit}
                >
                    {(formState) => (
                        <Form className={classes.form}>
                            <XTextInput
                                type='email'
                                name='username'
                                label='Email'
                                autoComplete="off"
                                autoFocus
                                margin="normal"
                            />

                            <XTextInput
                                type='password'
                                name='password'
                                label='Password'
                                autoComplete="off"
                                margin="normal"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                disabled={formState.isSubmitting}
                            >
                                Sign in
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Paper>
        </main>
    );
}


export const schema = yup.object().shape(
    {
        username: yup.string().email('Invalid email').required("Email is required"),
        password: yup.string().required("Password is required")
    }
);

export default Login


