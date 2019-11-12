import * as React from "react";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import XTextInput from "../../components/inputs/XTextInput";
import {Form, Formik} from 'formik';
import XSelectInput from "../../components/inputs/XSelectInput";
import {toOptions} from "../../components/inputs/inputHelpers";
import {Box} from "@material-ui/core";

interface IProps {
    onFilter: (data: any) => any
    loading:boolean
}

const Filter = ({onFilter,loading}: IProps) => {
    function handleSubmission(values: any) {
        onFilter(values)
    }

    return <Formik
        initialValues={{name: '', contactType: '', email: '', phone: '', nin: ''}}
        onSubmit={handleSubmission}
        validateOnBlur
        render={({submitForm, isSubmitting}) => (
            <Form>
                <Grid spacing={0} container>
                    <Grid item xs={12}>
                        <XTextInput
                            name="query"
                            label="Name"
                            type="text"
                            variant='outlined'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <XSelectInput
                            name="contactType"
                            label="Contact Type"
                            options={toOptions(['Company', 'Person'])}
                            variant='outlined'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <XTextInput
                            name="email"
                            label="Email"
                            type="email"
                            variant='outlined'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <XTextInput
                            name="phone"
                            label="Phone"
                            type="text"
                            variant='outlined'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <XTextInput
                            name="nin"
                            label="NIN"
                            type="text"
                            variant='outlined'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box pt={2}>
                            <Grid spacing={2} container>
                                <Grid item xs={6}>
                                    <Button
                                        disabled={loading}
                                        variant="contained"
                                        fullWidth
                                        onClick={submitForm}>Clear</Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        disabled={loading}
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={submitForm}>Apply</Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Form>
        )}
    />
}

export default Filter
