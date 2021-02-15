import React, { useState } from 'react';
import * as yup from 'yup';
import { Box, Button, Grid } from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import EditDialog from '../../../../components/EditDialog';
import XForm from '../../../../components/forms/XForm';
import { reqObject, reqString } from '../../../../data/validations';
import { XMapsInput } from '../../../../components/inputs/XMapsInput';
import { XRemoteSelect } from '../../../../components/inputs/XRemoteSelect';
import { remoteRoutes } from '../../../../data/constants';
import { FormikHelpers } from 'formik';
import { post } from '../../../../utils/ajax';
import Toast from '../../../../utils/Toast';

const schema = yup.object().shape(
    {
        churchLocation: reqObject,
        residence: reqString
    }
)

const initialValues = {
    churchLocation: '',
    residence: '',
}

const NewRequest = (props: any) => {

    const [dialog, setDialog] = useState<boolean>(false);

    const handleAddNew = () => {
        setDialog(true)
    }

    const handleClose = () => {
        setDialog(false)
    }

    const getPrimaryEmail = () => {
        const emailList = props.user.emails;
        for (let i = 0; i < emailList.length; i++) {
            if(emailList[i].isPrimary) {
                return emailList[i].value;
            }
        }
        return emailList[0].value;
    }

    const getPrimaryPhone = () => {
        const phoneList = props.user.phones;
        for(let i = 0; i < phoneList.length; i++) {
            if (phoneList[i].isPrimary) {
                return phoneList[i].value;
            }
        }
        return phoneList[0].value;
    }

    const handleSubmit = (values: any, actions: FormikHelpers<any>) => {
        
        handleClose()

        const toSave = {
            contactId: props.contactId,
            email: getPrimaryEmail(),
            phone: getPrimaryPhone(),
            churchLocation: values.churchLocation.id,
            residencePlaceId: values.residence.place_id,
            residenceDescription: values.residence.description
        }

        post(remoteRoutes.groupsRequest, toSave, resp => {
            Toast.success("Group Request Successfully Made")
        })

    }


    return (
        <>
            <Box display='flex'>
                <Box flexGrow={1}>&nbsp;</Box>
                <Box pr={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        size='small'
                        startIcon={<AddIcon/>}
                        onClick={handleAddNew}
                    >
                        New Request &nbsp;&nbsp;
                    </Button>
                </Box>
            </Box>

            <EditDialog open={dialog} onClose={handleClose} title="New Group Request">
                <XForm
                    onSubmit={handleSubmit}
                    schema={schema}
                    initialValues={initialValues}
                >
                    <div style={{padding: 8}}>
                        <Grid spacing={2} container className='min-width-100'>

                            <Grid item md={6} xs={12}>
                                <XRemoteSelect
                                    remote={remoteRoutes.groupsCombo}
                                    filter={{'categories[]': 'Location'}}
                                    parser={({name, id}: any) => ({name: name, id: id})}
                                    name="churchLocation"
                                    label="Church Location"
                                    variant="outlined"
                                    margin="none"
                                />
                            </Grid>

                            <Grid item md={6} xs={12}>
                                <XMapsInput 
                                    name="residence"
                                    label="Residence"
                                    variant="outlined"
                                    margin="none"
                                />
                            </Grid>

                        </Grid>
                    </div>
                </XForm>
            </EditDialog>
        </>
    )
}

export default NewRequest


