import React from 'react';
import {useDispatch} from 'react-redux';
import {servicesConstants} from "../../data/volunteers/reducer";
import {put} from "../../utils/ajax";
import XForm from "../../components/forms/XForm";
import * as yup from "yup";
import {reqString} from "../../data/validations";
import {FormikHelpers} from "formik";
import {Box} from "@material-ui/core";
import {remoteRoutes} from "../../data/constants";

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";

import MaterialTable, { Column } from 'material-table';
import Toast from '../../utils/Toast';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from "@material-ui/core/Grid";
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { IUpdateAMembershipDto } from './types';

interface IProps {
    data: any | null
    contactId: string
    done?: () => any
}

interface Row {
    id: number;
    firstName: string;
    lastName: string;
    ministry: [];
}
  
interface TableState {
    columns: Array<Column<Row>>;
    data: Row[];
}

const schema = yup.object().shape(
    {
        ministry: reqString,
    }
)

const initialValues = {
    ministry: [],
}

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

const ListOfVolunteers = ({data, done, contactId}: IProps) => {
    const dispatch = useDispatch();
    const classes = useStyles();

    // For displaying the table data
    const [state, setData] = React.useState<TableState>({
        columns: [
          { title: 'First name', field: 'firstName' },
          { title: 'Last name', field: 'lastName' },
          { title: 'Ministry', field: 'ministry' },
          { title: 'Edit', field: 'edit' },
        ],
        data: [
        ],
    });

    // For opening and closing the dialog
    const [open, setOpen] = React.useState(false);
    const [volunteer, setVolunteer] = React.useState({id:0, firstName: "", lastName: "", contactId: 0, groupMembership: {id: 0}, group: []});
  
    const handleClickOpen = (volunteer: any) => {
        setVolunteer(volunteer)
        setOpen(true);
    };
  
    const handleClose = () => {
        setOpen(false);
    };
    // END

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        values.ministry.map((item: any, index: any) => {
            const toSaveToGroupMemberships: IUpdateAMembershipDto = {
                id: volunteer.groupMembership.id,
                groupId: item.value,
                contactId: volunteer.contactId,
                role: "Volunteer",
            }
            // Add person to group_membership table
            put(remoteRoutes.groupsMemberships, toSaveToGroupMemberships,
                (data) => {
                    if (index === values.groupId.length-1){
                        dispatch({
                            type: servicesConstants.servicesAddVolunteer,
                            payload: {...data},
                        })
                    }
                    // Then send email to new volunteer
                    // get a instance of sendgrid and set the API key
                    const sendgrid = require('@sendgrid/mail');
                    sendgrid.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);// construct an email
                    const email = {
                    to: 'd.buyinza@student.ciu.ac.ug', // TODO: Remember to change this to a variable to pick the actual email of person when deploying to production
                    from: process.env.REACT_APP_FROM, // must include email address of the sender
                    subject: 'Your ministry team has been changed',
                    html: 'Hello ' + volunteer.firstName + ', <br>This is simply to notify you that your ministry team in which you\'re serving at Worship Harvest Ministries has been changed. You are now serving in ' + values.ministry.label,
                    };// send the email via sendgrid
                    sendgrid.send(email)
                    .then(() => { Toast.info("An email notification has been sent to the volunteer") }, (error: { response: { body: any; }; }) => {
                        console.error(error);
                        
                        if (error.response) {
                            console.error(error.response.body)
                        }
                    });
                },
                undefined,
                () => {
                    actions.setSubmitting(false);
                }
            )
            if (done) {
                done()
            }
        })
        Toast.info('Operation successful')
        actions.resetForm()
    }

    React.useEffect(() => {
        async function fetchVolunteers() {
            const res = await fetch(remoteRoutes.contactsPersonVolunteer);
            if (res.status >= 200 && res.status <= 299) {
                const json = await res.json();
                setData({
                    ...state,
                    data:json.map((volunteer: any) => {
                        return {
                            firstName: volunteer.firstName,
                            lastName: volunteer.lastName,
                            ministry: volunteer.group.map((ministryName: any) => { return ministryName.name }).join(", "),
                            edit: <span onClick={() => handleClickOpen(volunteer)}><EditIcon/></span>,
                        }
                    })
                })
            } else {
                Toast.error('Unable to retrieve the list of volunteers.')
                console.log(res.status, res.statusText);
            }
        }
        fetchVolunteers();
    }, []);


    return(
        <Navigation>
            <Box p={1} className={classes.root}>
                <Header title="View volunteers" />
                <MaterialTable
                    title="Volunteers"
                    columns={state.columns}
                    data={state.data}
                />

                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Edit volunteer</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You are currently editing <b>{volunteer.firstName} {volunteer.lastName}'s</b> ministry details. They are currently in the following ministries:  <b>{volunteer.group.map((ministryName: any) => { return ministryName.name }).join(", ")}</b>.
                        </DialogContentText>
                        <XForm
                            onSubmit={handleSubmit}
                            schema={schema}
                            initialValues={initialValues}
                        >
                            <Grid spacing={0} container>
                                <Grid item xs={12}>
                                    <XRemoteSelect
                                        multiple
                                        remote={remoteRoutes.groupsCombo}
                                        filter={{'categories[]': 'M'}}
                                        parser={({name, id}: any) => ({label: name, value: id})}
                                        name="ministry"
                                        label="Ministry"
                                        variant='outlined'
                                    />
                                </Grid>
                            </Grid>
                        </XForm>
                    </DialogContent>
                </Dialog>
            </Box>
        </Navigation>
    );
}

export default ListOfVolunteers;