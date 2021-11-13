import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditDialog from "../../../components/EditDialog";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import PinDropIcon from "@material-ui/icons/PinDrop";
import EventIcon from "@material-ui/icons/Event";
import PeopleIcon from "@material-ui/icons/People";
import Typography from "@material-ui/core/Typography";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import DateRangeIcon from "@material-ui/icons/DateRange";
import Divider from "@material-ui/core/Divider";
import EditIcon from "@material-ui/icons/Edit";
import { grey } from "@material-ui/core/colors";
import { appPermissions, localRoutes } from "../../../data/constants";
import Loading from "../../../components/Loading";
import { Alert } from "@material-ui/lab";
import { useHistory, useParams } from "react-router";
import Layout from "../../../components/layout/Layout";
import IconButton from "@material-ui/core/IconButton";
import MapLink from "../../../components/MapLink";
import { IState } from "../../../data/types";
import { hasAnyRole } from "../../../data/appRoles";
import TabbedView from "../../groups/TabbedView";
import XBreadCrumbs from "../../../components/XBreadCrumbs";
import {
  eventFetchAsync,
  eventsEdit,
  IEventState,
} from "../../../data/events/eventsReducer";
import EventForm from "../forms/EventForm";
import { printPrettyDate, printPrettyTime } from "../../../utils/dateHelpers";
import GroupLink from "../../../components/GroupLink";
import EventAttendance from "./EventAttendance";
import EventMetadata from "./EventMetadata";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(1),
      },
    },
    largeIcon: {
      width: theme.spacing(6),
      height: theme.spacing(6),
    },

    rootPaper: {
      padding: theme.spacing(2),
      borderRadius: 0,
    },
    description: {
      minHeight: 100,
      borderRadius: 5,
      backgroundColor: grey[100],
    },
  })
);

export default function Details() {
  let { eventId } = useParams<any>();
  const history = useHistory();
  const [dialog, setDialog] = useState<boolean>(false);
  const { selected: data, loading }: IEventState = useSelector(
    (state: any) => state.events
  );
  const dispatch = useDispatch();
  const profile = useSelector((state: IState) => state.core.user);
  const classes = useStyles();

  useEffect(() => {
    dispatch(eventFetchAsync(eventId));
  }, [dispatch, eventId]);

  const isLeader = () => {
    const userId = `${profile.id}`;
    const _leaderIds: number[] = data?.leaders || [];
    const leaderIds: string[] = _leaderIds.map((it) => `${it}`);

    const isLeader = leaderIds.indexOf(userId) > -1;

    return isLeader || hasAnyRole(profile, [appPermissions.roleGroupEdit]);
  };

  function handleClose() {
    setDialog(false);
  }

  function handleEdit() {
    setDialog(true);
  }

  function handleEdited(dt: any) {
    setDialog(false);
    dispatch(eventsEdit(dt));
  }

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  } else {
    if (!data) {
      return (
        <Layout>
          <Box
            p={4}
            className={classes.root}
            display="flex"
            justifyContent="center"
          >
            <Alert severity="error">Failed to load report data</Alert>
          </Box>
        </Layout>
      );
    }
  }

  function handleDeleted() {
    history.push(localRoutes.groups);
  }

  const tabs = [
    {
      name: "Extra data",
      component: <EventMetadata event={data} />,
    },
    {
      name: "Attendance",
      component: (
        <EventAttendance groupId={`${data.groupId}`} eventId={`${data.id}`} />
      ),
    },
  ];

  return (
    <Layout title="Event details">
      <Box className={classes.root}>
        <Box pb={2}>
          <XBreadCrumbs
            title="Event details"
            paths={[
              {
                path: localRoutes.home,
                label: "Dashboard",
                auth: hasAnyRole(profile, [appPermissions.roleDashboard]),
              },
              {
                path: localRoutes.events,
                label: "Events",
                auth: hasAnyRole(profile, [
                  appPermissions.roleEventView,
                  appPermissions.roleEventEdit,
                ]),
              },
            ]}
          />
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box display="flex" pb={1}>
              <Box pr={2}>
                <Avatar className={classes.largeIcon}>
                  <EventIcon />
                </Avatar>
              </Box>
              <Box flexGrow={1}>
                <Typography variant="h6">{data.name}</Typography>
                <Typography variant="body2">{`${data.privacy}, ${data.category.name}`}</Typography>
              </Box>

              {isLeader() ? (
                <Box pr={2}>
                  <IconButton
                    aria-label="Edit"
                    color="primary"
                    title="Edit Report"
                    onClick={handleEdit}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              ) : null}
            </Box>
            <Divider />
            <Box pl={1}>
              <Box display="flex" pt={1}>
                <Box pr={1}>
                  <PeopleIcon />
                </Box>
                <Box flexGrow={1} pt={0.5}>
                  <GroupLink id={data.group?.id} name={data.group?.name} />
                </Box>
              </Box>
              <Box display="flex" pt={1}>
                <Box pr={1}>
                  <DateRangeIcon />
                </Box>
                <Box flexGrow={1} pt={0.5}>
                  <Typography variant="caption" component="div">
                    From:&nbsp;{printPrettyDate(data.startDate)}&nbsp;at&nbsp;
                    {printPrettyTime(data.startDate)}
                  </Typography>
                  <Typography variant="caption" component="div">
                    To:&nbsp;{printPrettyDate(data.endDate)}&nbsp;at&nbsp;
                    {printPrettyTime(data.endDate)}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" pt={1}>
                <Box pr={1}>
                  <PinDropIcon />
                </Box>
                <Box flexGrow={1} pt={0.5}>
                  {data.venue ? (
                    <MapLink
                      title={data.venue.name!}
                      value={data.venue.placeId!}
                    />
                  ) : (
                    <Typography variant="caption">No address</Typography>
                  )}
                </Box>
              </Box>
            </Box>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <TabbedView tabs={tabs} />
          </Grid>
        </Grid>
        <EditDialog open={dialog} onClose={handleClose} title="Edit Report">
          <EventForm
            data={data}
            isNew={false}
            onUpdated={handleEdited}
            onDeleted={handleDeleted}
            onCancel={handleClose}
          />
        </EditDialog>
      </Box>
    </Layout>
  );
}
