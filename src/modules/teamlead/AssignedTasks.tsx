import React from 'react';
import { Box } from "@material-ui/core";
import { remoteRoutes } from "../../data/constants";

import Layout from "../../components/layout/Layout";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Header from "./Header";
import Toast from '../../utils/Toast';
import MaterialTable, { Column } from 'material-table';

interface IProps {
    data: any | null
    done?: () => any
}

interface Row {
    taskName: string;
    startDate: Date;
    endDate: Date;
    taskInfo: string;
    firstName: string;
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

const AssignedTasks = ({ done }: IProps) => {
    const classes = useStyles();

    // For displaying the table data
    const [state, setData] = React.useState<TableState>({
        columns: [
            { title: 'Task Name', field: 'taskName' },
            { title: 'Start Date', field: 'startDate' },
            { title: 'End Date', field: 'endDate' },
            { title: 'Task Details', field: 'taskDescription' },
            { title: 'Volunteers', field: 'userId' },
        ],
        data: [
        ],
    });

   

    React.useEffect(() => {
        async function fetchAppointments() {
            const res = await fetch(remoteRoutes.assignedTasks);
            if (res.status >= 200 && res.status <= 299) {
                const json = await res.json();
                setData({
                    ...state,
                    data:json.map((anAssignedTask: any) => {
                        return {
                            taskName: anAssignedTask.task.taskName,
                            // taskId: appointment.taskId,
                            startDate: anAssignedTask.app.startDate,
                            endDate: anAssignedTask.app.endDate,
                            taskDescription: anAssignedTask.task.taskDescription,
                            //taskName: appointment.task.map((task: any) => { return task.taskName }).join(", "),
                        
                        }
                    })
                })
            } else {
                Toast.error('Unable to retrieve the list of appointments.')
                console.log(res.status, res.statusText);
            }
        }
        fetchAppointments();
    }, []);



    // React.useEffect(() => {
    //     async function fetchAppointments() {
    //         const res = await fetch(remoteRoutes.userTask);
    //         if (res.status >= 200 && res.status <= 299) {
    //             const json = await res.json();
    //             setData({
    //                 ...state,
    //                 data:json.map((aUserTask: any) => {
    //                     return {
    //                         // UserId: aUserTask.user[0].UserId,
    //                         // taskId: appointment.taskId,
    //                         // startDate: anAssignedTask.app[0].startDate,
    //                         // endDate: anAssignedTask.app[0].endDate,
    //                         // taskDescription: anAssignedTask.task[0].taskDescription,
    //                         //taskName: appointment.task.map((task: any) => { return task.taskName }).join(", "),
                        
    //                     }
    //                 })
    //             })
    //         } else {
    //             Toast.error('Unable to retrieve the list of appointments.')
    //             console.log(res.status, res.statusText);
    //         }
    //     }
    //     fetchAppointments();
    // }, []);



    return (
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