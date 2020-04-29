import React from 'react';
import {Box} from "@material-ui/core";
import {remoteRoutes} from "../../data/constants";

import Navigation from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";

import MaterialTable, { Column } from 'material-table';
import {printBirthday} from "../../utils/dateHelpers";

interface IProps {
    data: any | null
    done?: () => any
}

interface Row {
    firstName: string;
    surname: string;
    ministry: string;
    profession: string;
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
          { title: 'Surname', field: 'surname' },
          { title: 'Ministry', field: 'ministry' },
          { title: 'Profession', field: 'profession' },
        ],
        data: [
        ],
    });

    React.useEffect(() => {
        async function fetchVolunteers() {
            const res = await fetch(remoteRoutes.volunteers);
            const json = await res.json();
            console.log(json);
            setData({
                ...state,
                data:json
            })
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