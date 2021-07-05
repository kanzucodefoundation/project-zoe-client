import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IGroup } from "./types";
import EditDialog from "../../components/EditDialog";
import GroupEditor from "./editors/GroupEditor";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import PinDropIcon from "@material-ui/icons/PinDrop";
import PeopleIcon from "@material-ui/icons/People";
import Typography from "@material-ui/core/Typography";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Button, ButtonGroup, Hidden, Theme } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import EditIcon from "@material-ui/icons/Edit";
import EventIcon from "@material-ui/icons/Event";
import MembersList from "./members/MembersList";
import { grey } from "@material-ui/core/colors";
import { get } from "../../utils/ajax";
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from "../../data/constants";
import Loading from "../../components/Loading";
import {
  Alert,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@material-ui/lab";
import { useHistory, useParams } from "react-router";
import Layout from "../../components/layout/Layout";
import MapLink from "../../components/MapLink";
import { IState } from "../../data/types";
import { hasAnyRole, hasRole } from "../../data/appRoles";
import MemberRequests from "./members/MemberRequests";
import TabbedView from "./TabbedView";
import XBreadCrumbs from "../../components/XBreadCrumbs";
import GroupEventsList from "./GroupEventsList";
import EventForm from "../events/forms/EventForm";

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
      minHeight: 70,
      borderRadius: 5,
      backgroundColor: grey[100],
    },
    speedDial: {
      position: "fixed",
      "&.MuiSpeedDial-directionDown": {
        top: theme.spacing(15),
        right: theme.spacing(4),
      },
    },
  })
);

export default function Details() {
  let { groupId } = useParams<any>();
  const history = useHistory();
  const [dialog, setDialog] = useState<boolean>(false);
  const [event, setNewEvent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IGroup | null>(null);
  const [open, setOpen] = useState(false);
  const profile = useSelector((state: IState) => state.core.user);
  const classes = useStyles();
  const hasEventEdit = hasRole(profile, appPermissions.roleEventEdit);
  const hasGroupEdit = hasRole(profile, appPermissions.roleGroupEdit);
  const actions = [];

  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.groups}/${groupId}`,
      (data) => {
        setData(data);
      },
      undefined,
      () => {
        setLoading(false);
      }
    );
  }, [groupId]);

  const isLeader = () => {
    if (data?.leaders && data?.leaders.length === 0) {
      return false;
    }
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
    setData(dt);
  }

  const handleDialClose = () => {
    setOpen(false);
  };

  const handleDialOpen = () => {
    setOpen(true);
  };

  const createEventTitle = "New Event";

  function handleNewEvent() {
    setNewEvent(true);
  }

  function handleNewEventClose() {
    setNewEvent(false);
  }

  const handleIconClick = (operation: any) => {
    if (operation === "Edit Group") {
      handleEdit();
    } else if (operation === "New Event") {
      handleNewEvent();
    }
    setOpen(!open);
  };

  if (loading)
    return (
      <Layout>
        <Loading />
      </Layout>
    );

  if (!data)
    return (
      <Layout>
        <Box
          p={4}
          className={classes.root}
          display="flex"
          justifyContent="center"
        >
          <Alert severity="error">Failed to load group data</Alert>
        </Box>
      </Layout>
    );

  function handleDeleted() {
    history.push(localRoutes.groups);
  }

  const tabs = [
    {
      name: "Members",
      component: (
        <MembersList groupId={Number(groupId)} isLeader={isLeader()} />
      ),
    },
  ];
  if (isLeader()) {
    tabs.push({
      name: "Reports",
      component: <GroupEventsList reports={data.reports ? data.reports : []} />,
    });
    tabs.push({
      name: "Requests",
      component: <MemberRequests group={data} />,
    });
  }

  if (hasEventEdit) {
    actions.push({
      icon: <EditIcon color="primary" />,
      name: "Edit Group",
      operation: "Edit Group",
    });
  }

  if (hasGroupEdit) {
    actions.push({
      icon: <EventIcon color="primary" />,
      name: "New Event",
      operation: "New Event",
    });
  }

  return (
    <Layout title="Group details">
      <Box className={classes.root}>
        <Box pb={2}>
          <XBreadCrumbs
            title="Group details"
            paths={[
              {
                path: localRoutes.home,
                label: "Dashboard",
                auth: hasAnyRole(profile, [appPermissions.roleDashboard]),
              },
              {
                path: localRoutes.groups,
                label: "Groups",
                auth: hasAnyRole(profile, [
                  appPermissions.roleGroupEdit,
                  appPermissions.roleGroupView,
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
                  <PeopleIcon />
                </Avatar>
              </Box>
              <Box flexGrow={1}>
                <Typography variant="h6">{data.name}</Typography>
                <Typography variant="body2">{`${data.privacy}, ${data.category.name}`}</Typography>
                <Typography variant="body2">{`${data.name} attendance this month: ${data.totalAttendance} (${data.percentageAttendance}%)`}</Typography>
              </Box>

              {isLeader() ? (
                <>
                  <Hidden smDown>
                    <Box pr={2}>
                      <ButtonGroup variant="contained">
                        {hasGroupEdit ? (
                          <Button
                            color="primary"
                            size="small"
                            variant="contained"
                            onClick={handleEdit}
                          >
                            Edit Group&nbsp;&nbsp;
                          </Button>
                        ) : undefined}
                        {hasEventEdit ? (
                          <Button
                            color="primary"
                            size="small"
                            variant="contained"
                            onClick={handleNewEvent}
                          >
                            Create Report&nbsp;&nbsp;
                          </Button>
                        ) : undefined}
                      </ButtonGroup>
                    </Box>
                  </Hidden>
                  <Hidden mdUp>
                    <SpeedDial
                      ariaLabel="SpeedDial"
                      className={classes.speedDial}
                      icon={<SpeedDialIcon />}
                      onClose={handleDialClose}
                      onOpen={handleDialOpen}
                      onClick={handleIconClick}
                      open={open}
                      direction="down"
                      color="primary"
                      FabProps={{
                        size: "small",
                      }}
                    >
                      {actions.map((action) => (
                        <SpeedDialAction
                          key={action.name}
                          icon={action.icon}
                          tooltipTitle={action.name}
                          tooltipPlacement="left"
                          onClick={() => {
                            handleIconClick(action.operation);
                          }}
                        />
                      ))}
                    </SpeedDial>
                  </Hidden>
                </>
              ) : null}
            </Box>
            <Divider />
            <Box display="flex" pt={1}>
              <Box pr={2}>
                <PinDropIcon />
              </Box>
              <Box flexGrow={1} pt={0.5}>
                {data.address ? (
                  <MapLink
                    title={data.address.name!}
                    value={data.address.placeId!}
                  />
                ) : (
                  <Typography variant="caption">No address</Typography>
                )}
              </Box>
            </Box>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column">
              <Box pb={1}>
                <Typography variant="h6" style={{ fontSize: "0.92rem" }}>
                  About:
                </Typography>
              </Box>
              <Box className={classes.description} p={2}>
                <Typography variant="body2">{data.details}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TabbedView tabs={tabs} />
          </Grid>
        </Grid>
        <EditDialog open={dialog} onClose={handleClose} title="Edit Group">
          <GroupEditor
            data={data}
            isNew={false}
            onUpdated={handleEdited}
            onDeleted={handleDeleted}
            onCancel={handleClose}
          />
        </EditDialog>
        <EditDialog
          title={createEventTitle}
          open={event}
          onClose={handleNewEventClose}
        >
          <EventForm
            data={{
              group: {
                id: data.id,
                name: data.name,
                categoryId: data.categoryId,
              },
            }}
            isNew={true}
            onCreated={handleNewEventClose}
            onCancel={handleNewEventClose}
          />
        </EditDialog>
      </Box>
    </Layout>
  );
}
