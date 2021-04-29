import { Box, Button, Chip, createStyles, Divider, Fab, Hidden, List, ListItem, ListItemAvatar, ListItemText, makeStyles, Theme } from "@material-ui/core";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { IMobileRow } from "../../components/DataList";
import { XHeadCell } from "../../components/table/XTableHead";
import { IEventCategory, IEventFields } from "./types";
import EventIcon from "@material-ui/icons/Event";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { appRoles, localRoutes, remoteRoutes } from "../../data/constants";
import { search } from "../../utils/ajax";
import Loading from "../../components/Loading";
import Navigation from "../../components/layout/Layout";
import { Alert } from "@material-ui/lab";
import XTable from "../../components/table/XTable"
import { hasAnyRole } from "../../data/appRoles";
import AddIcon from "@material-ui/icons/Add";
import { IState } from "../../data/types";
import XBreadCrumbs from "../../components/XBreadCrumbs";
import EventCategoryForm from "./forms/EventCategoryForm";
import EditDialog from "../../components/EditDialog";

interface IProps {
    id: number;
    name: string;
    fields: IEventFields;
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
        secondary:(
            <Box pt={0.5}>
            {data.fields?.map((it: any) => (
                <Chip
                  color="primary"
                  variant="outlined"
                  key={it}
                  style={{ margin: 5, marginLeft: 0, marginTop: 0 }}
                  size="small"
                  label={it.label}
                />
            ))}
            </Box>
       )
    };
};

const EventCategories = ({name, fields}:IProps) => {
    const classes = useStyles();
    const history = useHistory();
    const user = useSelector((state: IState) => state.core.user);
    const [eventCategory, setNewEventCategory] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<IEventCategory[]>([]);

    const createTitle = "New Event Category";

    function handleNewEventCategory(){
        setNewEventCategory(true);
    }
    const handleRowClick = (id: number) => {
        history.push(`${localRoutes.eventsCategories}/${id}`);
    };

    const handleItemClick = (id: number) => () => {
        handleRowClick(id);
    };

    function handleNewEventCategoryClose(){
        setNewEventCategory(false);
    }

    const fetchEventCategories = useCallback(() => {
        setLoading(true);
        search(
            remoteRoutes.eventsCategories,
            {
                name:name,
                fields:fields,
            },
            (data) => {
                setData(data);
            },
            undefined,
            () => setLoading(false) 
        );
    }, [name, fields]);

    useEffect(() => {
        fetchEventCategories();
    }, [fetchEventCategories]);

    if (loading) return <Loading/>;

    return (
        <Navigation>
            <Box p={1} className={classes.root}>
                <Box pb={2}>
                    <XBreadCrumbs
                        title="Event Categories"
                        paths={[
                            {
                                path: localRoutes.home,
                                label: "Dashboard",
                            },
                            {
                                path: localRoutes.events,
                                label: "Events",
                            },
                        ]}
                    />
                </Box>
                <Hidden smDown>
                    <Box pt={1}>
                        {hasAnyRole(user, [appRoles.roleEventEdit]) && (
                            <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleNewEventCategory}
                            style={{ marginLeft: 8 }}
                            >
                            Add new&nbsp;&nbsp;
                            </Button>
                        )}
                    </Box>
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
                                handleSelection={handleRowClick}
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
                    {hasAnyRole(user, [appRoles.roleEventEdit]) ? (
                    <Fab
                        aria-label="add-new"
                        className={classes.fab}
                        color="primary"
                        onClick={handleNewEventCategory}
                    >
                        <AddIcon />
                    </Fab>
                    ) : null}
                </Hidden>
            </Box>
            <EditDialog title={createTitle} open={eventCategory} onClose={handleNewEventCategoryClose}>
                <EventCategoryForm data={{}} isNew={true} onCreated={handleNewEventCategoryClose} />
            </EditDialog>
        </Navigation>
    )

}

export default EventCategories;
