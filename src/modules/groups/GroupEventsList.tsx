import {Box, 
        createStyles, 
        Divider, 
        Grid, 
        Hidden, 
        List, 
        ListItem, 
        ListItemAvatar, 
        ListItemText, 
        makeStyles, 
        Theme, 
        Typography } from '@material-ui/core';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { IMobileRow } from '../../components/DataList';
import PersonAvatar from '../../components/PersonAvatar';
import { XHeadCell } from '../../components/table/XTableHead';
import { printDate } from '../../utils/dateHelpers';
import EventLink from '../events/EventLink';
import { IEvent, IGroupEvent } from '../events/types';
import Loading from '../../components/Loading';
import XTable from '../../components/table/XTable';
import { useHistory } from 'react-router';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { search } from "../../utils/ajax";
import { Alert } from '@material-ui/lab';
import EditDialog from '../../components/EditDialog';
import EventForm from '../events/forms/EventForm';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
        },
    })
);

interface IProps {
    groupId: number;
}

const headCells: XHeadCell[] = [
    {   name: "id",
        label: "Name",
        render: (value, rec) => <EventLink id={value} name={rec.name}/>
    },
    {   name: "category.name", 
        label: "Category" 
    },
    {   name: "startDate", 
        label: "Start Date", 
        render: printDate 
    },
    {   name: "attendance", 
        label: "Attendance" 
    },
];

const toMobileRow = (data: IEvent): IMobileRow => {
    return {
        avatar: <PersonAvatar data={data} />,
        primary: data.name,
        secondary: (
            <>
                <Typography variant="caption" color="textSecondary" display="block">
                    {data.category.name}: {printDate(data.startDate)}
                </Typography>
            </>
        )
    };
};

const GroupEventsList = ({ groupId }: IProps) => {
    const classes = useStyles();
    const history = useHistory();
    const [event, setNewEvent] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<IGroupEvent[]>([]);
   
    const createTitle = "New Event";
    const handleItemClick = (id: string) => () => {
        history.push(`${localRoutes.contacts}/${id}`);
    };

    function handleNewEvent (){
        setNewEvent(true)
    }

    function handleNewEventClose (){
        setNewEvent(false)
    }

    const fetchGroupEvents = useCallback(() => {
        setLoading(true);
        search(
            remoteRoutes.events,
            {
                groupId:groupId
            },
            data => {
                setData(data);
            },
            undefined,
            () => {
                setLoading(false);
            }
        );
    }, [groupId]);

    useEffect(() => {
        fetchGroupEvents();
    }, [fetchGroupEvents]);

    if (loading) return <Loading />;

    return (
        <Grid container>
            <Box p={1} className={classes.root}>
                <Hidden smDown>
                    <Box pt={1}>
                        {data.length === 0 ? (
                            <ListItem button onClick={handleNewEvent}>
                                <Alert severity="info" style={{ width: "100%" }}>
                                    No events click to add new
                                </Alert>
                            </ListItem>
                        ) : (
                            <XTable
                                headCells={headCells}
                                data={data}
                                initialRowsPerPage={10}
                                initialSortBy="name"
                                handleSelection={handleItemClick}
                            />
                        )}
                    </Box>
                    <EditDialog title={createTitle} open={event} onClose={handleNewEventClose}>
                        <EventForm data={{}} isNew={true} onCreated={handleNewEventClose}/>
                    </EditDialog>
                </Hidden>
                <Hidden mdUp>
                    <List>
                    {data.length === 0 ? (
                        <ListItem button onClick={handleNewEvent}>
                            <Alert severity="info" style={{ width: "100%" }}>
                                No events click to add new
                            </Alert>
                        </ListItem>
                    ) : (
                        data.map((row: any) => {
                            const mobileRow = toMobileRow(row);
                            return (
                                <Fragment key={row.id}>
                                    <ListItem
                                    alignItems="flex-start"
                                    button
                                    disableGutters
                                    onClick={handleItemClick(row.id)}
                                    >
                                        <ListItemAvatar>{mobileRow.avatar}</ListItemAvatar>
                                        <ListItemText
                                            primary={mobileRow.primary}
                                            secondary={mobileRow.secondary}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </Fragment>
                            );
                        })
                    )}
                    </List>
                    <EditDialog title={createTitle} open={event} onClose={handleNewEventClose}>
                        <EventForm data={{}} isNew={true} onCreated={handleNewEventClose}/>
                    </EditDialog>
                </Hidden>
            </Box>
        </Grid>
        
    );
}


export default GroupEventsList;  

