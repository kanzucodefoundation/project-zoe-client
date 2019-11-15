import React, {useEffect, useState} from "react";
import Navigation from "../../components/layout/Layout";
import Paper from '@material-ui/core/Paper';
import {createStyles, makeStyles, Theme, useTheme} from "@material-ui/core";
import {getEmail, getPhone, IContact, renderName} from "./types";
import XTable from "../../components/table/XTable";
import {XHeadCell} from "../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import Filter from "./Filter";
import EmailLink from "../../components/EmalLink";
import ContactLink from "../../components/ContactLink";
import {search} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import Loading from "../../components/Loading";
import Box from "@material-ui/core/Box";
import Header from "./Header";
import Hidden from "@material-ui/core/Hidden";
import ContactItem from "./ContactItem";
import EditDialog from "../../components/EditDialog";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import NewContactForm from "./NewContactForm";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";

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

const headCells: XHeadCell[] = [
    {name: 'id', label: 'Name', render: (value, rec) => <ContactLink id={value} name={renderName(rec.person)}/>},
    {name: 'category', label: 'Category'},
    {name: 'email', label: 'Email', render: (_, rec) => <EmailLink value={getEmail(rec)}/>},
    {name: 'phone', label: 'Phone', render: (_, rec) => getPhone(rec)},
];


const Contacts = () => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const [createDialog, setCreateDialog] = useState(false);
    const [desktopFilter, setDesktopFilter] = useState(true);
    const [mobileFilter, setMobileFilter] = useState(false);
    const [filter, setFilter] = useState({});
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const classes = useStyles();

    function handleFilterToggle() {
        if (isSmall) {
            setMobileFilter(true)
        } else {
            setDesktopFilter(!desktopFilter);
        }
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
        setFilter({...filter, ...value})
    }

    function handleNew() {
        setCreateDialog(true)
    }

    function closeCreateDialog() {
        setCreateDialog(false)
    }

    return (
        <Navigation>
            <Box p={1} className={classes.root}>
                <Header onAddNew={handleNew} onFilterToggle={handleFilterToggle} title='Contacts'/>
                <Hidden smDown>
                    <Grid container spacing={2}>
                        <Grid item xs={desktopFilter ? 9 : 12}>
                            {
                                loading ? <Loading/> :
                                    <XTable
                                        headCells={headCells}
                                        data={data}
                                        initialRowsPerPage={10}
                                    />
                            }
                        </Grid>

                        <Grid item xs={3} style={{display: desktopFilter ? "block" : "none"}}>
                            <Paper className={classes.filterPaper} elevation={0}>
                                <Filter onFilter={handleFilter} loading={loading}/>
                            </Paper>
                        </Grid>
                    </Grid>
                </Hidden>
                <Hidden mdUp>
                    <Grid container spacing={1}>
                        {
                            loading ? <Loading/> :
                            data.map((it: IContact) =>
                                <Grid item xs={12} sm={6} md={4} xl={3} key={it.id}>
                                    <ContactItem data={it}/>
                                </Grid>
                            )
                        }
                    </Grid>
                    <EditDialog open={mobileFilter} onClose={() => setMobileFilter(false)} title="Contact Filter">
                        <Filter onFilter={handleFilter} loading={loading}/>
                    </EditDialog>
                    <Fab aria-label='add-new' className={classes.fab} color='primary' onClick={handleNew}>
                        <AddIcon/>
                    </Fab>
                </Hidden>
            </Box>
            <EditDialog title='New Person' open={createDialog} onClose={closeCreateDialog}>
                <NewContactForm data={{}} done={closeCreateDialog}/>
            </EditDialog>
        </Navigation>
    );
}

export default Contacts
