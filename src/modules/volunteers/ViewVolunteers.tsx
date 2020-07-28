import React from 'react';
import {useDispatch} from 'react-redux';
import {servicesConstants} from "../../data/volunteers/reducer";
import {post} from "../../utils/ajax";
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
import { sendEmail } from '../../utils/sendEmail';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from "@material-ui/core/Grid";
import { XRemoteSelect } from '../../components/inputs/XRemoteSelect';
import { ICreateAMembershipDto } from './types';
import XCheckBoxInput from '../../components/inputs/XCheckBoxInput';

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
    teamLead: ""
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
          { title: 'Add to ministry', field: 'addToMinistry' },
          { title: 'Remove', field: 'remove' },
        ],
        data: [
        ],
    });

    // For opening and closing the dialog
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openRemove, setOpenRemove] = React.useState(false);
    const [volunteer, setVolunteer] = React.useState({id:0, firstName: "", lastName: "", email: {value: ""}, contactId: 0, ageGroup: "", groupMembership: [], group: []});
  
    const handleClickOpenForEdit = (volunteer: any) => {
        setVolunteer(volunteer);
        setOpenEdit(true);
    };
  
    const handleClickOpenForRemove = (volunteer: any) => {
        setVolunteer(volunteer);
        setOpenRemove(true);
    };
  
    const handleCloseEdit = () => {
        setOpenEdit(false);
    };
  
    const handleCloseRemove = () => {
        setOpenRemove(false);
    };
    // END

    function handleSubmit(values: any, actions: FormikHelpers<any>) {
        // Checking to see if any of the selected ministries are among the teams the volunteer belongs to
        let ministryTeamsVolunteerIsIn = volunteer.groupMembership.map((ministry: any) => { return ministry.groupId });
        let theSelectedTeams = values.ministry.map((ministry: any) => { return ministry.value }); // groupIds of ministries selected in the form
        let namesOfTheSelectedTeams = values.ministry.map((ministry: any) => { return ministry.label }).join(" and "); // Names of ministries selected in the form
        let counter = 1;
        for (const thisMinistryTeam of theSelectedTeams) {
            if (!ministryTeamsVolunteerIsIn.includes(thisMinistryTeam)) {
                const toSaveToGroupMemberships: ICreateAMembershipDto = {
                    groupId: thisMinistryTeam,
                    contactId: volunteer.contactId,
                    role: values.teamLead === true ? "Team Lead" : "Volunteer",
                    isActive: true,
                }
                // Add person to group_membership table
                post(remoteRoutes.groupsMemberships, toSaveToGroupMemberships,
                    (data) => {
                        if (counter === theSelectedTeams.length) {
                            fetchVolunteers();
                        }
                        counter = counter + 1;
                        dispatch({
                            type: servicesConstants.servicesAddVolunteer,
                            payload: {...data},
                        })
                    }
                );
            }
        }
        // Then send email to the volunteer on adding them to a ministry/ministries
        sendEmail(volunteer.email.value, 'Your are now serving in a new ministry.', 'Hello ' + volunteer.firstName + ', <br>We would like to update you about some changes to your ministry team(s) under which you are serving. <b>You have now been added to the ' + namesOfTheSelectedTeams + ' team</b>.<br><br>All our best regards and thank you for serving,<br>Worship Harvest Ministries.', 'An email notification has been sent to the volunteer');

        actions.setSubmitting(false);
        if (done) {
            done()
        }

        Toast.info('Operation successful')
        handleCloseEdit()
        handleCloseRemove()
        actions.resetForm()
    }

    function handleRemoveFromMinistry(values: any, actions: FormikHelpers<any>) {
        // Checking to see if any of the selected ministries are among the teams the volunteer belongs to
        let groupIdVolunteerIsIn = volunteer.groupMembership.map((ministry: any) => { return ministry.groupId });
        let tableIdVolunteerIsIn = volunteer.groupMembership.map((ministry: any) => { return ministry.id });
        let theSelectedTeams = values.ministry.map((ministry: any) => { return ministry.value }); // IDs of ministries selected in the form
        let namesOfTheSelectedTeams = values.ministry.map((ministry: any) => { return ministry.label }).join(" and "); // Names of ministries selected in the form (used in email)
        let counter = 1;
        for (const thisMinistryTeam of theSelectedTeams) {
            if (groupIdVolunteerIsIn.includes(thisMinistryTeam)) {
                let tableIdOfMinistryToRemove = tableIdVolunteerIsIn[groupIdVolunteerIsIn.indexOf(thisMinistryTeam)];

                const updateIsActive = async() => {
                    let response = await fetch(remoteRoutes.groupsMemberships, {
                        method: "PATCH",
                        body: JSON.stringify({
                            id: tableIdOfMinistryToRemove,
                            contactId: volunteer.contactId,
                            role: "Volunteer",
                            isActive: 0,
                        }),
                        headers: {
                        "Accept": "application/JSON",
                        "Content-Type": "application/json",
                        },
                    })
                    if (response.status !== 200) {
                        Toast.error("Couldn't remove the volunteer from this ministry.")
                    } else if (response.status === 200) {
                        if (counter === theSelectedTeams.length) {
                            fetchVolunteers();
                        }
                        counter = counter + 1;
                        Toast.info('Operation successful')
                    }
                }
                updateIsActive();
            }
        }

        // Then send email to the volunteer on removing them from a ministry/ministries
        sendEmail(volunteer.email.value, 'You have been removed from a ministry.', 'Hello ' + volunteer.firstName + ', <br>We would like to update you about some changes to your ministry team(s) under which you are serving. <b>You have been removed from the ' + namesOfTheSelectedTeams + ' team</b>.<br>If this appears to be an error, please reach out to any of our team leaders.<br><br>All our best regards and thank you for serving,<br>Worship Harvest Ministries.', 'An email notification has been sent to the volunteer');

        actions.setSubmitting(false);
        if (done) {
            done()
        }

        handleCloseEdit()
        handleCloseRemove()
        actions.resetForm()
    }

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
                        ministry: volunteer.group.map((ministryName: any) => {
                            return ministryName.name +
                            volunteer.groupMembership.map((ministry: any) => {
                                if (ministryName.id === ministry.groupId && ministry.role === "Team Lead") {
                                    return " (TL)"
                                } else if (ministryName.id === ministry.groupId && ministry.role === "Volunteer") {
                                    return ""
                                }
                            }).join("")
                        }).join(", "),
                        addToMinistry: <span onClick={() => handleClickOpenForEdit(volunteer)}><AddCircleOutlineIcon /></span>,
                        remove: <span onClick={() => handleClickOpenForRemove(volunteer)}><RemoveCircleOutlineIcon /></span>,
                    }
                })
            })
        } else {
            Toast.error('Unable to retrieve the list of volunteers.')
            console.log(res.status, res.statusText);
        }
    }

    React.useEffect(() => {
        fetchVolunteers();
    }, []);

    return(
        <Navigation>
            <Box p={1} className={classes.root}>
                <Header title="View volunteers" />
                <p>TL - Volunteer is the Team Lead of the given ministry</p>
                <MaterialTable
                    title="Volunteers"
                    columns={state.columns}
                    data={state.data}
                />

                <Dialog open={openEdit} onClose={handleCloseEdit} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Add volunteer to ministry</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <b>{volunteer.firstName} {volunteer.lastName}</b> is currently a volunteer in the following ministries:  <b>{volunteer.group.map((ministryName: any) => { return ministryName.name + volunteer.groupMembership.map((ministry: any) => { if (ministryName.id === ministry.groupId && ministry.role === "Team Lead") { return " (TL)" } else if (ministryName.id === ministry.groupId && ministry.role === "Volunteer") { return "" } }).join("") }).join(", ")}</b>.
                            Their age group: {volunteer.ageGroup} years.
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
                                        label="Select the ministry you'd like to add them to"
                                        variant='outlined'
                                    />
                                </Grid>
                            </Grid>

                            <Grid spacing={0} container>
                                <Grid item xs={12}>
                                    <XCheckBoxInput
                                        name="teamLead"
                                        label="Make them the Team Lead of the selected ministry"
                                    />
                                </Grid>
                            </Grid>
                        </XForm>
                    </DialogContent>
                </Dialog>

                <Dialog open={openRemove} onClose={handleCloseRemove} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Remove volunteer from ministry</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <b>{volunteer.firstName} {volunteer.lastName}</b> is currently a volunteer in the following ministries:  <b>{volunteer.group.map((ministryName: any) => { return ministryName.name + volunteer.groupMembership.map((ministry: any) => { if (ministryName.id === ministry.groupId && ministry.role === "Team Lead") { return " (TL)" } else if (ministryName.id === ministry.groupId && ministry.role === "Volunteer") { return "" } }).join("") }).join(", ")}</b>.
                        </DialogContentText>
                        <XForm
                            onSubmit={handleRemoveFromMinistry}
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
                                        label="Select the ministry you are removing them from"
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