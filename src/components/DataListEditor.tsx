import React, {Fragment} from "react";
import Paper from '@material-ui/core/Paper';
import {createStyles, makeStyles, Theme, useTheme} from "@material-ui/core";
import XTable from "./table/XTable";
import {XHeadCell} from "./table/XTableHead";
import Grid from '@material-ui/core/Grid';
import Filter from "../modules/contacts/Filter";
import {localRoutes} from "../data/constants";
import Loading from "./Loading";
import EditDialog from "./EditDialog";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import {IMobileRow} from "./DataList";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import {useHistory} from "react-router";

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
    filter?: any
    onFilter: (q: any) => any
    onItemClick: (q: any) => any
    onCloseFilter: () => any
    contactForm?: any
    data: any[]
    loading: boolean
    showFilter: boolean
    toMobileRow : (data: any)=> IMobileRow
    columns: XHeadCell[]
}

const DataListEditor = ({data, loading,showFilter,onFilter,onCloseFilter,toMobileRow,columns}: IProps) => {
    const history = useHistory();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const classes = useStyles();
    if (loading) {
        return <Loading/>
    }

    if (isSmall) {
        return <>
            <List>
                {
                    data.map((row: any) => {
                        const mobileRow = toMobileRow(row)
                        return <Fragment key={row.id}>
                            <ListItem alignItems="flex-start" button disableGutters
                                      onClick={() => history.push(`${localRoutes.contacts}/${row.id}`)}
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
            <EditDialog open={showFilter} onClose={onCloseFilter} title="Contact Filter">
                <Filter onFilter={onFilter} loading={loading}/>
            </EditDialog>
        </>
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={showFilter ? 9 : 12}>
                <XTable
                    headCells={columns}
                    data={data}
                    initialRowsPerPage={10}
                />
            </Grid>
            <Grid item xs={3} style={{display: showFilter ? "block" : "none"}}>
                <Paper className={classes.filterPaper} elevation={0}>
                    <Filter onFilter={onFilter} loading={loading}/>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default DataListEditor
