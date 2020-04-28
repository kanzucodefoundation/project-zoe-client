import React from 'react';
import * as yup from "yup";
import {reqString} from "../../data/validations";
import {ministryCategories} from "../../data/comboCategories";
import {FormikHelpers} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XSelectInput from "../../components/inputs/XSelectInput";
import {toOptions} from "../../components/inputs/inputHelpers";
import {Box} from "@material-ui/core";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {remoteRoutes} from "../../data/constants";

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";

interface IProps {
    data: any | null
    done?: () => any
}

// const schema = yup.object().shape(
//     {
//         ministry: reqString
//     }
// )

// const initialValues = {
//     ministry: '',
// }


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

const ListOfVolunteers = ({done}: IProps) => {
    const classes = useStyles();

    // function handleSubmit(values: any, actions: FormikHelpers<any>) {

    // }

    const [volunteers, setVolunteers] = React.useState([]);

    React.useEffect(() => {
        async function fetchVolunteers() {
            const res = await fetch('http://localhost:4002/api/services/volunteers');
            const json = await res.json();
            setVolunteers(json.data);
        }
        fetchVolunteers();
    }, []);

    return(
        <ul>
            {volunteers.map(volunteer => (
                <li key={volunteer.id}>{volunteer.firstName}</li>
            ))};
        </ul>
        // <Navigation>
        //     <Box p={1} className={classes.root}>
        //         <Header title="View volunteers" />

        //         <Grid item xs={6}>
        //             <XForm
        //                 onSubmit={handleSubmit}
        //                 schema={schema}
        //                 initialValues={initialValues}
        //             >
        //                 <Grid spacing={0} container>
        //                     <Grid item xs={12}>
        //                         <XSelectInput
        //                             name="ministry"
        //                             label="Ministry"
        //                             options={toOptions(ministryCategories)}
        //                             variant='outlined'
        //                         />
        //                     </Grid>
        //                 </Grid>
        //             </XForm>

        //             <h4>Volunteers</h4>
        //             <List>
        //                 {[0, 1, 2, 3].map((item) => (
        //                 <ListItem><ListItemText primary={`${item + 1}. Volunteer`} /></ListItem>
        //                 ))}
        //             </List>
                    
        //             <ul>
        //                 volunteers.map(volunteer => (
        //                     <li key={volunteer.id}>{volunteer.firstName}</li>
        //                 ));
        //             </ul>
        //         </Grid>
        //     </Box>
        // </Navigation>
    );
}

export default ListOfVolunteers;





// import React, {Fragment, useEffect, useState} from "react";
// import Navigation from "../../components/layout/Layout";
// import Paper from '@material-ui/core/Paper';
// import {Avatar, createStyles, makeStyles, Theme, useTheme} from "@material-ui/core";
// import {IVolunteerListDto, IVolunteersFilter} from "./types";
// import XTable from "../../components/table/XTable";
// import {XHeadCell} from "../../components/table/XTableHead";
// import Grid from '@material-ui/core/Grid';
// import Filter from "./Filter";
// import ContactLink from "../../components/ContactLink";
// import {search} from "../../utils/ajax";
// import {localRoutes, remoteRoutes} from "../../data/constants";
// import Loading from "../../components/Loading";
// import Box from "@material-ui/core/Box";
// import Header from "./Header";
// import Hidden from "@material-ui/core/Hidden";
// import EditDialog from "../../components/EditDialog";
// import useMediaQuery from "@material-ui/core/useMediaQuery/useMediaQuery";
// import AddIcon from "@material-ui/icons/Add";
// import Fab from "@material-ui/core/Fab";
// import {IMobileRow} from "../../components/DataList";
// import PersonIcon from '@material-ui/icons/Person';
// import List from "@material-ui/core/List";
// import ListItem from "@material-ui/core/ListItem";
// import ListItemAvatar from "@material-ui/core/ListItemAvatar";
// import ListItemText from "@material-ui/core/ListItemText";
// import Divider from "@material-ui/core/Divider";
// import {useHistory} from "react-router";
// import {hasValue} from "../../components/inputs/inputHelpers";
// import {useDispatch, useSelector} from "react-redux";
// import {servicesConstants, IServicesState} from "../../data/volunteers/reducer";
// import GroupLink from "../../components/GroupLink";

// const useStyles = makeStyles((theme: Theme) =>
//     createStyles({
//         root: {
//             flexGrow: 1,
//         },
//         filterPaper: {
//             borderRadius: 0,
//             padding: theme.spacing(2)
//         },
//         fab: {
//             position: 'absolute',
//             bottom: theme.spacing(2),
//             right: theme.spacing(2),
//         },
//     }),
// );

// const headCells: XHeadCell[] = [
//     {name: 'id', label: 'Name', render: (value, rec) => <ContactLink id={value} name={rec.name}/>},
//     {
//         name: 'cellGroup',
//         label: 'MC',
//         render: value => hasValue(value) ? <GroupLink id={value.id} name={value.name}/> : '-na-'
//     },
// ];

// const toMobileRow = (data: IVolunteerListDto): IMobileRow => {
//     const hasAvatar = hasValue(data.avatar)
//     return {
//         avatar: hasAvatar ?
//             <Avatar
//                 alt="Avatar"
//                 src={data.avatar}
//             /> : <Avatar><PersonIcon/></Avatar>,
//         primary: data.name,
//         secondary: <>
//         </>,
//     }
// }

// const ListOfVolunteers = () => {
//     const dispatch = useDispatch();
//     const history = useHistory();
//     const theme = useTheme();
//     const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
//     const [createDialog, setCreateDialog] = useState(false);
//     const {data, loading}: IServicesState = useSelector((state: any) => state.crm)
//     const [showFilter, setShowFilter] = useState(!isSmall);
//     const [filter, setFilter] = useState<IVolunteersFilter>({});

//     const classes = useStyles();
//     useEffect(() => {
//         if (isSmall) {
//             setShowFilter(false)
//         }
//     }, [isSmall])

//     useEffect(() => {
//         dispatch({
//             type: servicesConstants.servicesFetchLoading,
//             payload: true,
//         })
//         search(
//             remoteRoutes.volunteers,
//             filter,
//             (resp) => {
//                 dispatch({
//                     type: servicesConstants.servicesFetchAll,
//                     payload: [...resp],
//                 })
//             },
//             undefined,
//             () => {
//                 dispatch({
//                     type: servicesConstants.servicesFetchLoading,
//                     payload: false,
//                 })
//             })
//     }, [filter, dispatch])


//     function handleFilter(value: any) {
//         setFilter({...filter, ...value})
//     }

//     function handleNew() {
//         setCreateDialog(true)
//     }

//     const handleItemClick = (id: string) => () => {
//         history.push(`${localRoutes.contacts}/${id}`)
//     }

//     const filterComponent = <Filter onFilter={handleFilter} loading={loading}/>
//     const filterTitle = "Contact Filter"
//     return (
//         <Navigation>
//             <Box p={1} className={classes.root}>
//                 <Header title="View volunteers" />
//                 <Hidden smDown>
//                     <Grid container spacing={2}>
//                         <Grid item xs={showFilter ? 9 : 12}>
//                             {
//                                 loading ? <Loading/> :
//                                     <XTable
//                                         headCells={headCells}
//                                         data={data}
//                                         initialRowsPerPage={10}
//                                     />
//                             }
//                         </Grid>
//                         <Grid item xs={3} style={{display: showFilter ? "block" : "none"}}>
//                             <Paper className={classes.filterPaper} elevation={0}>
//                                 {filterComponent}
//                             </Paper>
//                         </Grid>
//                     </Grid>
//                 </Hidden>
//                 <Hidden mdUp>
//                     <List>
//                         {
//                             loading ? <Loading/> :
//                                 data.map((row: any) => {
//                                     const mobileRow = toMobileRow(row)
//                                     return <Fragment key={row.id}>
//                                         <ListItem alignItems="flex-start" button disableGutters
//                                                   onClick={handleItemClick(row.id)}
//                                         >
//                                             <ListItemAvatar>
//                                                 {mobileRow.avatar}
//                                             </ListItemAvatar>
//                                             <ListItemText
//                                                 primary={mobileRow.primary}
//                                                 secondary={mobileRow.secondary}
//                                             />
//                                         </ListItem>
//                                         <Divider component="li"/>
//                                     </Fragment>
//                                 })
//                         }
//                     </List>
//                     <EditDialog open={showFilter} onClose={() => setShowFilter(false)} title={filterTitle}>
//                         {filterComponent}
//                     </EditDialog>
//                     <Fab aria-label='add-new' className={classes.fab} color='primary' onClick={handleNew}>
//                         <AddIcon/>
//                     </Fab>
//                 </Hidden>
//             </Box>
//         </Navigation>
//     );
// }

// export default ListOfVolunteers;
