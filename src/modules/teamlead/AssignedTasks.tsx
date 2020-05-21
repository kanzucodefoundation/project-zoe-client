import React from 'react';
import {Box} from "@material-ui/core";
import {remoteRoutes} from "../../data/constants";

import Layout from "../../components/layout/Layout";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import Header from "./Header";

import MaterialTable, { Column } from 'material-table';

interface IProps {
    data: any | null
    done?: () => any
}

interface Row {
    taskId: string;
    start_date: Date;
    end_date: Date;
    task_info: string;
    assigned_to: string;
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

const AssignedTasks = ({done}: IProps) => {
    const classes = useStyles();

    // For displaying the table data
    const [state, setData] = React.useState<TableState>({
        columns: [
          { title: 'Task Nmae', field: 'taskId' },
          { title: 'Start Date', field: 'start_date' },
          { title: 'End Date', field: 'end_date' },
          { title: 'Task Details', field: 'task_info' },
          { title: 'Volunteers', field: 'assigned_to' },
        ],
        data: [
        ],
    });

    React.useEffect(() => {
        async function fetchTeamlead() {
            const res = await fetch(remoteRoutes.day);
            const json = await res.json();
            console.log(json);
            setData({
                ...state,
                data:json
            })
        }
        fetchTeamlead();
    }, []);


    return(
        <Layout>
            <Box p={1} className={classes.root}>
                <Header title="Assigned Tasks" />
                <MaterialTable
                    title="Assigned Tasks"
                    columns={state.columns}
                    data={state.data}
                />
            </Box>
        </Layout>
    );
}

export default AssignedTasks;