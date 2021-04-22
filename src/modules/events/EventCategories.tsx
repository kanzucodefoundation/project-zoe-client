import { Box, createStyles, Divider, Hidden, List, ListItem, ListItemAvatar, ListItemText, makeStyles, Theme } from "@material-ui/core";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { IMobileRow } from "../../components/DataList";
import { XHeadCell } from "../../components/table/XTableHead";
import { IEventCategory } from "./types";
import EventIcon from "@material-ui/icons/Event";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { localRoutes, remoteRoutes } from "../../data/constants";
import { search } from "../../utils/ajax";
import Loading from "../../components/Loading";
import Navigation from "../../components/layout/Layout";
import { Alert } from "@material-ui/lab";
import XTable from "../../components/table/XTable"

interface IProps {
    id: number;
    name: string;
    // isLeader: boolean;
}


const useStyles = makeStyles((theme:Theme) =>
    createStyles({
        root:{
            flexGrow:1,
        },
        filterPaper: {
            borderRadius: 0,
            padding: theme.spacing(2),
        },
        fab: {
            position: "absolute",
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    })
);

const headCells: XHeadCell[] = [
    {
        name: "name",
        label: "Event Category",
    },  
]

const toMobileRow = (data:IEventCategory): IMobileRow => {
    return{
        avatar: <EventIcon/>,
        primary: data.name,
        secondary: data.name,
    };
};

const EventCategories = ({name}:IProps) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    const [eventCategory, setNewEventCategory] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<IEventCategory[]>([]);

    const createTitle = "New Event Category";

    const handleItemClick = (id: number) => () => {
        history.push(`${localRoutes.eventsCategories}/${id}`);
    }

    function handleNewEventCategory(){
        setNewEventCategory(true);
    }

    function handleNewEventCategoryClose(){
        setNewEventCategory(false);
    }

    const fetchEventCategories = useCallback(() => {
        setLoading(true);
        search(
            remoteRoutes.eventsCategories,
            {
                name:name,
            },
            (data) => {
                setData(data);
            },
            undefined,
            () => setLoading(false)
        );
    }, [name]);
    console.log("eh",name)

    useEffect(() => {
        fetchEventCategories();
    }, [fetchEventCategories]);

    if (loading) return <Loading/>;

    return (
        <Navigation>
            <Box p={1} className={classes.root}>
                <Hidden smDown>
                    <Box pt={1}>
                        {data.length === 0 ? (
                            <ListItem button onClick={handleNewEventCategory}>
                                <Alert severity="info" style={{width:"100%"}}>
                                    No event categories click to add new
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
                </Hidden>
                <Hidden mdUp>
                    <List>
                        {data.length === 0 ? (
                            <ListItem button onClick={handleNewEventCategory}>
                                <Alert severity="info" style={{width:"100%"}}>
                                    No event categories click to add new
                                </Alert>
                            </ListItem>
                        ) : (
                            data.map((row: any) => {
                                const mobileRow = toMobileRow(row);
                                return (
                                    <Fragment key={row.id}>
                                        <ListItem alignItems="flex-start" button disableGutters onClick={handleItemClick(row.name)}>
                                            <ListItemAvatar>{mobileRow.avatar}</ListItemAvatar>
                                            <ListItemText primary={mobileRow.primary} secondary={mobileRow.secondary}/>
                                        </ListItem>
                                        <Divider component="li"/>
                                    </Fragment>
                                );
                            })
                        )}
                    </List>
                    {/* {hasAnyRole(user, [appRoles.roleEventEdit]) ? (
                    <Fab
                    aria-label="add-new"
                    className={classes.fab}
                    color="primary"
                    onClick={handleNew}
                    >
                    <AddIcon />
                    </Fab>
                    ) : null} */}
                </Hidden>
            </Box>
        </Navigation>
    )

}

export default EventCategories;
