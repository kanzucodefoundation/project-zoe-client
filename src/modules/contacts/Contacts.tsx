import React, {Fragment, useEffect, useState} from "react";
import Navigation from "../../components/layout/Layout";
import Paper from '@material-ui/core/Paper';
import {Avatar, createStyles, makeStyles, Theme, useTheme} from "@material-ui/core";
import {getEmail, getPhone, IContact, IContactsFilter, renderName} from "./types";
import XTable from "../../components/table/XTable";
import {XHeadCell} from "../../components/table/XTableHead";
import Grid from '@material-ui/core/Grid';
import Filter from "./Filter";
import EmailLink from "../../components/EmalLink";
import ContactLink from "../../components/ContactLink";
import {search} from "../../utils/ajax";
import {localRoutes, remoteRoutes} from "../../data/constants";
import Loading from "../../components/Loading";
import Box from "@material-ui/core/Box";
import Header from "./Header";
import Hidden from "@material-ui/core/Hidden";
import EditDialog from "../../components/EditDialog";
import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
import NewContactForm from "./NewContactForm";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Typography from "@material-ui/core/Typography";
import {IMobileRow} from "../../components/DataList";
import PersonIcon from '@material-ui/icons/Person';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import {useHistory} from "react-router";
import {hasValue} from "../../components/inputs/inputHelpers";
import {useDispatch, useSelector} from "react-redux";
import {crmConstants, ICrmState} from "../../data/contacts/reducer";
import {ITagState} from "../../data/tags/reducer";

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

const toMobileRow = (data: IContact): IMobileRow => {
    const hasAvatar = hasValue(data.person.avatar)
    return {
        avatar: hasAvatar ?
            <Avatar
                alt="Avatar"
                src={data.person.avatar}
            /> : <Avatar><PersonIcon/></Avatar>,
        primary: renderName(data.person),
        secondary: <>
            <Typography variant='caption' color='textSecondary' display='block'>{getEmail(data)}</Typography>
            <Typography variant='caption' color='textSecondary'>{getPhone(data)}</Typography>
        </>,
    }
}


const Contacts = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const [createDialog, setCreateDialog] = useState(false);
    const {data, loading}: ICrmState = useSelector((state: any) => state.crm)
    const [showFilter, setShowFilter] = useState(!isSmall);
    const [filter, setFilter] = useState<IContactsFilter>({});


    const classes = useStyles();
    useEffect(() => {
        if (isSmall) {
            setShowFilter(false)
        }
    }, [isSmall])

    function handleFilterToggle() {
        setShowFilter(!showFilter);
    }


    useEffect(() => {
        dispatch({
            type: crmConstants.crmFetchLoading,
            payload: true,
        })
        search(
            remoteRoutes.contacts,
            filter,
            (resp) => {
                dispatch({
                    type: crmConstants.crmFetchAll,
                    payload: [...resp],
                })
            },
            undefined,
            () => {
                dispatch({
                    type: crmConstants.crmFetchLoading,
                    payload: false,
                })
            })
    }, [filter, dispatch])


    function handleFilter(value: any) {
        setFilter({...filter, ...value})
    }

    function handleNew() {
        setCreateDialog(true)
    }

    const handleItemClick = (id: string) => () => {
        history.push(`${localRoutes.contacts}/${id}`)
    }

    function closeCreateDialog() {
        setCreateDialog(false)
    }

    function handleNameSearch(query: string) {
        setFilter({...filter, query})
    }

    const filterComponent = <Filter onFilter={handleFilter} loading={loading}/>
    const createComponent = <NewContactForm data={{}} done={closeCreateDialog}/>
    const filterTitle = "Contact Filter"
    const createTitle = "New Person"
    return (
        <Navigation>
            <Box p={1} className={classes.root}>
                <Header
                    onAddNew={handleNew}
                    onFilterToggle={handleFilterToggle}
                    title='Contacts'
                    onChange={handleNameSearch}
                />
                <Hidden smDown>
                    <Grid container spacing={2}>
                        <Grid item xs={showFilter ? 9 : 12}>
                            {
                                loading ? <Loading/> :
                                    <XTable
                                        headCells={headCells}
                                        data={data}
                                        initialRowsPerPage={10}
                                    />
                            }
                        </Grid>
                        <Grid item xs={3} style={{display: showFilter ? "block" : "none"}}>
                            <Paper className={classes.filterPaper} elevation={0}>
                                {filterComponent}
                            </Paper>
                        </Grid>
                    </Grid>
                </Hidden>
                <Hidden mdUp>
                    <List>
                        {
                            loading ? <Loading/> :
                                data.map((row: any) => {
                                    const mobileRow = toMobileRow(row)
                                    return <Fragment key={row.id}>
                                        <ListItem alignItems="flex-start" button disableGutters
                                                  onClick={handleItemClick(row.id)}
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
                    <EditDialog open={showFilter} onClose={() => setShowFilter(false)} title={filterTitle}>
                        {filterComponent}
                    </EditDialog>
                    <Fab aria-label='add-new' className={classes.fab} color='primary' onClick={handleNew}>
                        <AddIcon/>
                    </Fab>
                </Hidden>
            </Box>
            <EditDialog title={createTitle} open={createDialog} onClose={closeCreateDialog}>
                {createComponent}
            </EditDialog>
        </Navigation>
    );
}

export default Contacts
