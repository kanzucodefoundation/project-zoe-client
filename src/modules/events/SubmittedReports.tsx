import Box from "@material-ui/core/Box/Box";
import React, { Fragment, useEffect } from "react";
import EventsFilter from "./EventsFilter";
import { localRoutes } from "../../data/constants";
import { useState } from "react";
import { eventsFetchAsync, IEventState } from "../../data/events/eventsReducer";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../data/types";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden/Hidden";
import XTable from "../../components/table/XTable";
import { XHeadCell } from "../../components/table/XTableHead";
import EventLink from "./EventLink";
import { printDate, printDateTime } from "../../utils/dateHelpers";
import { hasValue } from "../../components/inputs/inputHelpers";
import { useHistory } from "react-router";
import List from "@material-ui/core/List/List";
import { IEvent } from "./types";
import Typography from "@material-ui/core/Typography/Typography";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar/ListItemAvatar";
import { ListItemText, Divider } from "@material-ui/core";
import { IMobileRow } from "../../components/DataList";
import GroupLink from "../../components/GroupLink";
import ListHeader from "../../components/ListHeader";
import Loading from "../../components/Loading";
import PersonAvatar from "../../components/PersonAvatar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    filterPaper: {
      borderRadius: 0,
      padding: theme.spacing(2),
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  })
);

const headCells: XHeadCell[] = [
  {
    name: "group",
    label: "Group",
    render: (value) =>
      hasValue(value) ? <GroupLink id={value.id} name={value.name} /> : "-na-",
  },
  {
    name: "id",
    label: "Event",
    render: (value, rec) => <EventLink id={value} name={rec.name} />,
  },
  {
    name: "category.name",
    label: "Category",
  },
  {
    name: "startDate",
    label: "Start Date",
    render: printDate,
  },
  {
    name: "submittedBy",
    label: "Leader",
  },
];

const toMobileRow = (data: IEvent): IMobileRow => {
  return {
    avatar: <PersonAvatar data={data} />,
    primary: data.name,
    secondary: (
      <>
        <Typography variant="caption" color="textSecondary" display="block">
          Group: {data.group.name}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          {data.category.name}: {printDateTime(data.startDate)}
        </Typography>
        <Typography variant="caption" color="textPrimary" display="block">
          Leader: {data.submittedBy}
        </Typography>
      </>
    ),
  };
};

const SubmittedReports = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showDialog, setShowDialog] = useState(false);
  const { data, loading }: IEventState = useSelector(
    (state: any) => state.events
  );
  const [filter, setFilter] = useState<any>({
    limit: 5000,
    metadata: "submitted",
  });
  const user = useSelector((state: IState) => state.core.user);
  const [state, setState] = useState(true);
  const classes = useStyles();

  useEffect(() => {
    dispatch(eventsFetchAsync(filter));
  }, [filter, dispatch]);

  const handleRowClick = (id: string) => {
    history.push(`${localRoutes.events}/${id}`);
  };
  const handleItemClick = (id: string) => () => {
    handleRowClick(id);
  };

  return (
    <Box p={1} className={classes.root}>
      <ListHeader
        title="Group Reports"
        onFilter={setFilter}
        filter={filter}
        filterComponent={<EventsFilter onFilter={setFilter} />}
        loading={loading}
      />
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
              handleSelection={handleRowClick}
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
  );
};

export default SubmittedReports;
