import * as React from "react";
import Navigation from "../../components/layout/Layout";
import Grid from '@material-ui/core/Grid';
import XTextInput from "../../components/inputs/XTextInput";
import {FormikActions} from 'formik';
import XSelectInput from "../../components/inputs/XSelectInput";
import * as yup from 'yup';
import {reqString} from "../../data/validations";
import {hobbyCategories} from "../../data/comboCategories";
import {toOptions} from "../../components/inputs/inputHelpers";
import XForm from "../../components/forms/XForm";
import {ISelectOpt, RemoteSelect, XRemoteSelect} from "../../components/inputs/XRemoteSelect2";
import {remoteRoutes} from "../../data/constants";

const Settings = () => {
    function handleSubmission(values: any, actions: FormikActions<any>) {
        setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            actions.setSubmitting(false);
        }, 1000);
    }

    const schema = yup.object().shape(
        {
            firstName: reqString,
            hobbies: reqString
        }
    )
    return <Navigation>
        <Grid spacing={2} container>
            <Grid item xs={12}>
                <XForm
                    onSubmit={handleSubmission}
                    schema={schema}
                    debug
                >
                    <Grid spacing={2} container>
                        <Grid item sm={6}>
                            <XTextInput
                                name="firstName"
                                label="First Name"
                                type="text"
                                variant='outlined'
                            />
                        </Grid>

                        <Grid item sm={6}>
                            <XSelectInput
                                name="hobbies"
                                label="Hobbies"
                                options={toOptions(hobbyCategories)}
                                variant='standard'
                            />
                        </Grid>

                        <Grid item sm={6}>
                            <XRemoteSelect
                                name="person"
                                label="Person"
                                remote={remoteRoutes.contactsPerson}
                                parser={({id, name}: any):ISelectOpt => ({id, label: name})}
                            />
                        </Grid>
                    </Grid>
                </XForm>
                <RemoteSelect
                    name="person"
                    label="Person"
                    remote={remoteRoutes.contactsPerson}
                    parser={({id, fullName}: any):ISelectOpt => ({id, label: fullName})}
                />
            </Grid>
        </Grid>
    </Navigation>
}

export default Settings
