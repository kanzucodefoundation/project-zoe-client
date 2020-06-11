import React from 'react';
import {Box} from "@material-ui/core";
import {remoteRoutes} from "../../data/constants";

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";

import MaterialTable, { Column } from 'material-table';
import Toast from '../../utils/Toast';

interface IProps {
    data: any | null
    done?: () => any
}

interface Row {
    firstName: string;
    lastName: string;
    ministry: [];
}
  
interface TableState {
    columns: Array<Column<Row>>;
    data: Row[];
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

const ListOfVolunteers = ({done}: IProps) => {
    const classes = useStyles();

    // For displaying the table data
    const [state, setData] = React.useState<TableState>({
        columns: [
          { title: 'First name', field: 'firstName' },
          { title: 'Last name', field: 'lastName' },
          { title: 'Ministry', field: 'ministry' },
        ],
        data: [
        ],
    });

    React.useEffect(() => {
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
                            ministry: volunteer.group.map((ministryName: any) => { return ministryName.name }).join(", "),
                        }
                    })
                })
            } else {
                Toast.error('Unable to retrieve the list of volunteers.')
                console.log(res.status, res.statusText);
            }
        }
        fetchVolunteers();
    }, []);


    return(
        <Navigation>
            <Box p={1} className={classes.root}>
                <Header title="View volunteers" />
                <MaterialTable
                    title="Volunteers"
                    columns={state.columns}
                    data={state.data}
                />
            </Box>
        </Navigation>
    );
}

export default ListOfVolunteers;