import Box from "@material-ui/core/Box/Box";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Hidden from "@material-ui/core/Hidden/Hidden";
import XTable from "../../components/table/XTable";
import { XHeadCell } from "../../components/table/XTableHead";
import { hasValue } from "../../components/inputs/inputHelpers";
import { useHistory } from "react-router";
import List from "@material-ui/core/List/List";
import { IGroupReport } from "./types";
import Typography from "@material-ui/core/Typography/Typography";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar/ListItemAvatar";
import { Divider, ListItemText } from "@material-ui/core";
import { IMobileRow } from "../../components/DataList";
import GroupLink from "../../components/GroupLink";
import ListHeader from "../../components/ListHeader";
import Loading from "../../components/Loading";
import PersonAvatar from "../../components/PersonAvatar";
import {
  IGroupReportState,
  unsubEventsFetchAsync,
} from "../../data/events/groupReportsReducer";
import { localRoutes } from "../../data/constants";
import { addDays, format, lastDayOfWeek, startOfWeek } from "date-fns";
import UnsubEventsFilter from "./UnsubEventsFilter";

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
    name: "group.category",
    label: "Group Category",
  },
  {
    name: "eventCategory",
    label: "Report Type",
  },
  {
    name: "groupLeader",
    label: "Leader",
  },
  {
    name: "info",
    label: "Missing Report",
  },
];

const toMobileRow = (data: IGroupReport): IMobileRow => {
  return {
    avatar: <PersonAvatar data={data} />,
    primary: data.group.name,
    secondary: (
      <>
        <Typography variant="caption" color="textSecondary" display="block">
          {data.info}
        </Typography>
        <Typography variant="caption" color="textPrimary" display="block">
          Leader: {data.groupLeader}
        </Typography>
      </>
    ),
  };
};
const UnsubmittedReports = () => {
  const today = new Date();
  const lastWeekDate = addDays(today, -7);
  const startPeriod = startOfWeek(today);
  const endPeriod = lastDayOfWeek(today);
  const dispatch = useDispatch();
  const history = useHistory();
  const { data, loading }: IGroupReportState = useSelector(
    (state: any) => state.groupReports
  );
  const [filter, setFilter] = useState<any>({
    limit: 5000,
    from: `${format(new Date(startPeriod), "PP")}`,
    to: `${format(new Date(endPeriod), "PP")}`,
  });
  const classes = useStyles();

  useEffect(() => {
    dispatch(unsubEventsFetchAsync(filter));
  }, [filter, dispatch]);

  const handleRowClick = (id: string) => {
    history.push(`${localRoutes.groups}/${id}`);
  };
  const handleItemClick = (id: string) => () => {
    handleRowClick(id);
  };

  return (
    <Box p={1} className={classes.root}>
      <ListHeader
        title="Missing Group Reports"
        onFilter={setFilter}
        filter={filter}
        filterComponent={<UnsubEventsFilter onFilter={setFilter} />}
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
              initialSortBy="group"
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
                    onClick={handleItemClick(row.group.id)}
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

export default UnsubmittedReports;
