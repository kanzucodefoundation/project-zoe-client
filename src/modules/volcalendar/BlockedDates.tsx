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
    startDate: Date;
    endDate: Date;
    reason: string;
    fullName: string;
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

const BlockedDate = ({ done }: IProps) => {
    const classes = useStyles();

    // For displaying the table data
    const [state, setData] = React.useState<TableState>({
        columns: [            
            { title: 'Start Date', field: 'startDate' },
            { title: 'End Date', field: 'endDate' },
            { title: 'Reason', field: 'reason' },
            { title: 'Volunteer Name', field: 'fullName'},            
        ],
        data: [
        ],
    });

   

    React.useEffect(() => {
        async function fetchBlockedDates() {
            const res = await fetch(remoteRoutes.blockedDate);            
            console.log(res)
            if (res.status >= 200 && res.status <= 299) {
                const json = await res.json();
                setData({
                    ...state,
                    data:json.map((blockedDate: any) => {
                        return {

                            startDate: blockedDate.startDate,
                            endDate: blockedDate.endDate,
                            reason: blockedDate.reason,
                            fullName: blockedDate.fullName,                            
                        }
                    })
                })
            } else {
                Toast.error('Unable to retrieve the list of blocked dates.')
                console.log(res.status, res.statusText);
            }
        }
        fetchBlockedDates();
        console.log(fetchBlockedDates());
    }, []);   


    return (
        <Layout>
            <Box p={1} className={classes.root}>
                <Header title="Blocked Date" />
                <MaterialTable
                    title="Blocked Date"
                    columns={state.columns}
                    data={state.data}
                />
            </Box>
        </Layout>
    );
}

export default BlockedDate;