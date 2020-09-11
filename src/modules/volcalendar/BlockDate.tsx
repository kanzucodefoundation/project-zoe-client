import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import { reqDate, reqObject, reqString } from "../../data/validations";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";

import {remoteRoutes} from "../../data/constants";
import {useDispatch} from 'react-redux';
import {servicesConstants} from "../../data/blockedDates/reducer";
import {post} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import {Box} from "@material-ui/core";
import {ICreateABlockDateDto} from "./types";
import XDateInput from "../../components/inputs/XTimeInput";
import XTextInput from "../../components/inputs/XTextInput";

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';

interface IProps {
    data: any | null
    done?: () => any
}


const schema = yup.object().shape(
    {        
        startDate: reqDate,
        endDate: reqDate,
        reason: reqString,
        fullName: reqString

    }
)

const initialValues = {
    
    startDate: '',
    endDate: '',
    reason: '',
    fullName: '',

}

const RightPadded = ({ children, ...props }: any) => <Grid item xs={6}>
    <Box pr={1} {...props}>
        {children}
    </Box>
</Grid>

const LeftPadded = ({ children, ...props }: any) => <Grid item xs={6}>
    <Box pl={1} {...props}>
        {children}
    </Box>
</Grid>


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        filterPaper: {
            borderRadius: 0,
            padding: theme.spacing(2)
        },
        fab: {
            position: 'absolute',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    }),
);

const BlockDateForm = ({done}: IProps) => {
    const dispatch = useDispatch();
    const classes = useStyles();

    

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        console.log(values)
        
        
        const toSaveBlockedDateTable: ICreateABlockDateDto = {

            reason: values.reason, 
            startDate: values.startDate,
            endDate: values.endDate,
            fullName: values.fullName,
        }
                
        console.log(toSaveBlockedDateTable)

        // Add to blocked_date table
        post(remoteRoutes.blockedDate, toSaveBlockedDateTable,
            (data) => {
            	console.log(data)
            	Toast.info('Operation successful')
                actions.resetForm()
                dispatch({
                    type: servicesConstants.servicesAddBlockedDate,
                    payload: { ...data },
                })
                if (done)
                    done()
            },
            undefined,
            () => {
                actions.setSubmitting(false);

            }
        )
    }

    
    return (
    //   <Navigation>
        <Box p={1} className={classes.root}>
            <Header title="Block A Date" />

            <Grid item xs={6}>
                <Card className={classes.root}>
                    <CardContent>
                        <XForm
                            onSubmit={handleSubmit}
                            schema={schema}
                            initialValues={initialValues}
                        >                           

                            <XTextInput
                                name="reason"
                                label="reason"
                                type="text"
                                variant='outlined'
                            />

                            <RightPadded>
                            	<XDateInput
	                                name="startDate"
	                                label="Start Date"
                            />
                        	</RightPadded>

                        	<LeftPadded>
	                            <XDateInput
	                                name="endDate"
	                                label="End Date"

                            />
                        	</LeftPadded>
                            <XTextInput
                                name="fullName"
                                label="your name"
                                type="text"
                                variant='outlined'
                            />
                            
                        </XForm>
                    </CardContent>
                </Card>
            </Grid>

            <br />
        </Box>
    //   </Navigation>
    );
}


export default BlockDateForm;
