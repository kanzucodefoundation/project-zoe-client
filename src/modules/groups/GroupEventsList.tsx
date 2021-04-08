import {
  Box,
  createStyles,
  Divider,
  Grid,
  Hidden,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import React, { Fragment } from "react";
import { IMobileRow } from "../../components/DataList";
import { XHeadCell } from "../../components/table/XTableHead";
import { printDate } from "../../utils/dateHelpers";
import EventLink from "../events/EventLink";
import { IEvent } from "../events/types";
import XTable from "../../components/table/XTable";
import { useHistory } from "react-router";
import { localRoutes } from "../../data/constants";
import { Alert } from "@material-ui/lab";
import GroupLink from "../../components/GroupLink";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
  })
);

interface IProps {
  childEvents: IEvent[];
}

const headCells: XHeadCell[] = [
  {
    name: "id",
    label: "Name",
    render: (value, rec) => <EventLink id={value} name={rec.name} />,
  },
  { 
    name: "category.name", 
    label: "Category" 
  },
  {
    name: "group.id",
    label: "Group",
    render: (value, rec) => <GroupLink id={value} name={rec.name}/>,
  },
  { 
    name: "startDate", 
    label: "Start Date", 
    render: printDate 
  },
  {
    name: "attendancePercentage",
    label: "Attendance (%)",
  },
];

const toMobileRow = (data: IEvent): IMobileRow => {
  return {
    primary: data.name,
    secondary: (
      <>
        <Typography variant="caption" color="textSecondary" display="block">
          {data.category.name}: {printDate(data.startDate)}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          Group Name: {data.group.name}
        </Typography>
      </>
    ),
  };
};

const GroupEventsList = ({ childEvents }: IProps) => {
  const classes = useStyles();
  const history = useHistory();

  const handleItemClick = (id: string) => () => {
    history.push(`${localRoutes.events}/${id}`);
  };

  return (
    <Grid container>
      <Box p={1} className={classes.root}>
        <Hidden smDown>
          <Box pt={1}>
            <XTable
              headCells={headCells}
              data={childEvents}
              initialRowsPerPage={10}
              initialSortBy="name"
              handleSelection={handleItemClick}
            />
          </Box>
        </Hidden>
        <Hidden mdUp>
          <List>
            {childEvents.length < 0 ? (
              <ListItem>
                <Alert severity="info" style={{ width: "100%" }}>
                  No events to display
                </Alert>
              </ListItem>
            ) : (
              childEvents.map((row: any) => {
                const mobileRow = toMobileRow(row);
                return (
                  <Fragment key={row.id}>
                    <ListItem
                      alignItems="flex-start"
                      button
                      disableGutters
                      onClick={handleItemClick(row.id)}
                    >
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
    </Grid>
  );
};

export default GroupEventsList;
