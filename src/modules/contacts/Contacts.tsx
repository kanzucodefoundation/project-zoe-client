import React, {useEffect, useState} from "react";
import Navigation from "../../components/Layout";
import Paper from '@material-ui/core/Paper';
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import {getEmail, getPhone, renderName} from "./types";
import XTable from "../../components/table/XTable";
import {XHeadCell} from "../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import Filter from "./Filter";
import EmailLink from "../../components/EmalLink";
import ContactLink from "../../components/ContactLink";
import Collapse from '@material-ui/core/Collapse';
import {search} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import Loading from "../../components/Loading";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        drawer: {
            borderRadius: 0,
            padding: theme.spacing(2)
        },
        content: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            })
        },
        contentShift: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            })
        },
    }),
);

const headCells: XHeadCell[] = [
    {name: 'id', label: 'Name', render: (value, rec) => <ContactLink id={value} name={renderName(rec.person)}/>},
    {name: 'category', label: 'Category'},
    {name: 'email', label: 'Email', render: (_, rec) => <EmailLink value={getEmail(rec)}/>},
    {name: 'phone', label: 'Phone', render: (_, rec) => getPhone(rec)},
];


const Contacts = () => {
    const [open, setOpen] = useState(true);
    const [filter, setFilter] = useState({});
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const classes = useStyles();

    function handleFilterToggle() {
        setOpen(!open);
    }

    useEffect(() => {
        setLoading(true)
        search(
            remoteRoutes.contacts,
            filter,
            setData,
            undefined,
            () => setLoading(false))
    }, [filter])

    function handleFilter(value: any) {
        setFilter({...filter,...value})
    }

    return (
        <Navigation>
            <Grid className={classes.root} container spacing={2}>
                <Grid item xs={open ? 9 : 12}>
                    {
                        loading?<Loading/>:
                            <XTable
                                title="Contacts"
                                headCells={headCells}
                                data={data}
                                onFilterToggle={handleFilterToggle}
                                initialRowsPerPage={10}
                            />
                    }
                </Grid>

                <Grid item xs={3} style={{display: open ? "block" : "none"}}>
                    <Collapse in={open}>
                        <Paper className={classes.drawer}>
                            <Filter onFilter={handleFilter} loading={loading}/>
                        </Paper>
                    </Collapse>
                </Grid>
            </Grid>
        </Navigation>
    );
}

export default Contacts
