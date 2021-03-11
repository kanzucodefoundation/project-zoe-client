import { Box, createStyles, Divider, Hidden, List, ListItem, ListItemAvatar, ListItemText, makeStyles, Theme, Typography } from '@material-ui/core';
import Navigation from "../../../components/layout/Layout";
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { IMobileRow } from '../../../components/DataList';
import GroupLink from '../../../components/GroupLink';
import { hasValue } from '../../../components/inputs/inputHelpers';
import PersonAvatar from '../../../components/PersonAvatar';
import { XHeadCell } from '../../../components/table/XTableHead';
import { printDate } from '../../../utils/dateHelpers';
import EventLink from '../../events/EventLink';
import { IEvent } from '../../events/types';
import Loading from '../../../components/Loading';
import XTable from '../../../components/table/XTable';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { localRoutes, remoteRoutes } from '../../../data/constants';
import { IEventState } from '../../../data/events/eventsReducer';
import { search } from 'superagent';

interface IProps {
    groupId: number;
  }


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
        },
    })
);

const headCells: XHeadCell[] = [
    {
      name: "id",
      label: "Name",
      render: (value, rec) => <EventLink id={value} name={rec.name} />
    },
    { name: "categoryId", label: "Category" },
    { name: "startDate", label: "Start Date", render: printDate },
    {
      name: "percentageAttendance",
      label: "% Attendance"
    }
];


const toMobileRow = (data: IEvent): IMobileRow => {
    return {
        avatar: <PersonAvatar data={data} />,
        primary: data.name,
        secondary: (
            <>
                <Typography variant="caption" color="textSecondary" display="block">
                    {data.category}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    {printDate(data.startDate)}
                </Typography>
            </>
        )
    };
};




const GroupEventsList = () => {
    const classes = useStyles();
    const history = useHistory();
    // const [loading, setLoading] = useState<boolean>(false);
    // const [data, setData] = useState<IEvent[]>([]);
        
    const { data, loading }: IEventState = useSelector(
        (state: any) => state.events
      );


    /* const fetchGroupEvents = useCallback(() => {
        setLoading(true);
        search(
            remoteRoutes.events,
            {
                groupId: groupId
            },
            data => {
                setData(data);
            },
            undefined,
            () => {
                setLoading(false);
            }
        );
    }, [groupId]);

    useEffect(() => {
        fetchGroupEvents();
    }, [fetchGroupEvents]); */


    const handleItemClick = (id: string) => () => {
        history.push(`${localRoutes.contacts}/${id}`);
    };





    return (
        <div>
            <Box p={1} className={classes.root}>
                <Typography> Hello </Typography>
                <Hidden smDown>
                    <Box pt={1}>
                        {loading ? (
                        <Loading />
                        ) : (
                        <XTable
                            headCells={headCells}
                            data={data}
                            initialRowsPerPage={10}
                            initialSortBy="name"
                            handleSelection={handleItemClick}
                        />
                        )}
                    </Box>
                </Hidden>

                <Hidden mdUp>
                    <List>
                        {loading ? (
                        <Loading />
                        ) : (
                        data.map((row: any) => {
                            const mobileRow = toMobileRow(row);
                            return (
                            <Fragment key={row.id}>
                                <ListItem
                                alignItems="flex-start"
                                button
                                disableGutters
                                onClick={handleItemClick(row.id)}
                                >
                                <ListItemAvatar>{mobileRow.avatar}</ListItemAvatar>
                                <ListItemText
                                    primary={mobileRow.primary}
                                    secondary={mobileRow.secondary}
                                />
                                </ListItem>
                                <Divider component="li" />
                            </Fragment>
                            );
                        })
                        )}
                    </List>
                </Hidden>
            </Box>
        </div>
        
    );
}


export default GroupEventsList;  