import React, {useState} from "react";
import {Form, Formik, FormikHelpers} from 'formik';

import {Grid} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import {Alert} from "@material-ui/lab";
import {hasValue} from "../inputs/inputHelpers";

interface IProps {
    schema?: any
    onSubmit: (values: any, actions: FormikHelpers<any>) => any
    onCancel?: () => any
    onDelete?: () => any
    debug?: boolean
    loading?: boolean
    children?: React.ReactNode
    initialValues?: any
}

const XForm = (props: IProps) => {
    const [count, setCount] = useState<number>(0)

    function handleDelete() {
        if (count === 1) {
            setCount(0)
            props.onDelete && props.onDelete()
        } else {
            setCount(count + 1)
        }
    }

    return <Formik
        initialValues={props.initialValues || {}}
        onSubmit={props.onSubmit}
        validationSchema={props.schema}
        validateOnBlur
        enableReinitialize

    >{({submitForm, isSubmitting, values, errors, touched}) => (
        <Form>
            <Grid container spacing={0} style={{minWidth: 350}}>
                {
                    hasValue(errors) &&
                    <Grid item xs={12}>
                        <Box display='flex' justifyContent='center'>
                            <Alert severity="warning">Please provide all required fields(s)</Alert>
                        </Box>
                    </Grid>
                }
                <Grid item xs={12}>
                    <Box >
                        {props.children}
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box p={1} pt={2}>
                        <Grid container spacing={1} alignContent='flex-end' justify='flex-end'>
                            {
                                props.onDelete &&
                                <Grid item>
                                    <Button
                                        variant='contained'
                                        color='default'
                                        onClick={handleDelete}
                                        disabled={isSubmitting}
                                    >{count === 1 ? '! Confirm' : 'Delete'}</Button>
                                </Grid>
                            }
                            {
                                props.onCancel &&
                                <Grid item>
                                    <Button
                                        variant='contained'
                                        color='default'
                                        onClick={props.onCancel}
                                        disabled={isSubmitting || props.loading}
                                    >Cancel</Button>
                                </Grid>
                            }
                            <Grid item>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    onClick={submitForm}
                                    disabled={isSubmitting || props.loading}
                                >Submit</Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                {
                    props.debug &&
                    <Grid item xs={12}>
                                <pre style={{width: '100%', height: "100%"}}>
                                    {JSON.stringify({values, errors, touched}, null, 2)}
                                </pre>
                    </Grid>
                }
            </Grid>
        </Form>
    )}</Formik>
}

export default XForm
