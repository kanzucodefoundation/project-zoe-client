import React, {Fragment, useEffect, useState} from "react";
import Navigation from "../../components/layout/Layout";
import Paper from '@material-ui/core/Paper';
import {createStyles, makeStyles, Theme, useTheme} from "@material-ui/core";
import XTable from "../../components/table/XTable";
import {XHeadCell} from "../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import Loading from "../../components/Loading";
import Box from "@material-ui/core/Box";
import Header from "./Header";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../components/EditDialog";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import {IMobileRow} from "../../components/DataList";

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


interface IProps {
    filterComponent: any
    createComponent: any
    filterTitle: string
    createTitle: string
    handleFilter: (value: any) => any
    handleItemClick: (id: any) => any
    data: any[]
    loading: boolean
    headCells: XHeadCell[]
    toMobileRow: (data: any) => IMobileRow
}

const DataView = (props: IProps) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const [createDialog, setCreateDialog] = useState(false);
    const [showFilter, setShowFilter] = useState(!isSmall);
    const classes = useStyles();
    useEffect(() => {
        if (isSmall) {
            setShowFilter(false)
        }
    }, [isSmall])

    function handleFilterToggle() {
        setShowFilter(!showFilter);
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
                        <Grid item xs={showFilter ? 9 : 12}>
                            {
                                props.loading ? <Loading/> :
                                    <XTable
                                        headCells={props.headCells}
                                        data={props.data}
                                        initialRowsPerPage={10}
                                    />
                            }
                        </Grid>
                        <Grid item xs={3} style={{display: showFilter ? "block" : "none"}}>
                            <Paper className={classes.filterPaper} elevation={0}>
                                {props.filterComponent}
                            </Paper>
                        </Grid>
                    </Grid>
                </Hidden>
                <Hidden mdUp>
                    <List>
                        {
                            props.loading ? <Loading/> :
                                props.data.map((row: any) => {
                                    const mobileRow = props.toMobileRow(row)
                                    return <Fragment key={row.id}>
                                        <ListItem alignItems="flex-start" button disableGutters
                                                  onClick={props.handleItemClick(row.id)}
                                        >
                                            <ListItemAvatar>
                                                {mobileRow.avatar}
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={mobileRow.primary}
                                                secondary={mobileRow.secondary}
                                            />
                                        </ListItem>
                                        <Divider component="li"/>
                                    </Fragment>
                                })
                        }
                    </List>
                    <EditDialog open={showFilter} onClose={() => setShowFilter(false)} title={props.filterTitle}>
                        {props.filterComponent}
                    </EditDialog>
                    <Fab aria-label='add-new' className={classes.fab} color='primary' onClick={handleNew}>
                        <AddIcon/>
                    </Fab>
                </Hidden>
            </Box>
            <EditDialog title={props.createTitle} open={createDialog} onClose={closeCreateDialog}>
                {props.createComponent}
            </EditDialog>
        </Navigation>
    );
}

export default DataView
