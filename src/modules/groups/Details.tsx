import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GroupCategory, IGroup } from "./types";
import EditDialog from "../../components/EditDialog";
import GroupEditor from "./editors/GroupEditor";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import PinDropIcon from "@material-ui/icons/PinDrop";
import PeopleIcon from "@material-ui/icons/People";
import Typography from "@material-ui/core/Typography";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Button, Collapse, Link, List, ListItem, ListItemIcon, ListItemText, Theme } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import EditIcon from "@material-ui/icons/Edit";
import EventIcon from "@material-ui/icons/Event";
import MembersList from "./members/MembersList";
import { grey } from "@material-ui/core/colors";
import { get } from "../../utils/ajax";
import { appRoles, localRoutes, remoteRoutes } from "../../data/constants";
import Loading from "../../components/Loading";
import { Alert, AlertTitle, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import { useHistory, useParams } from "react-router";
import Layout from "../../components/layout/Layout";
import MapLink from "../../components/MapLink";
import { IState } from "../../data/types";
import { hasAnyRole } from "../../data/appRoles";
import MemberRequests from "./members/MemberRequests";
import TabbedView from "./TabbedView";
import XBreadCrumbs from "../../components/XBreadCrumbs";
import GroupEventsList from "./GroupEventsList";
import EventForm from "../events/forms/EventForm";
import ReportForm from "../reports/forms/ReportForm";
import { EventCategory } from "../events/types";
import { isThisWeek } from "date-fns/esm";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { green, red } from '@material-ui/core/colors';
import GroupLink from "../../components/GroupLink";

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
    speedDial: {
      position: "fixed",
      "&.MuiSpeedDial-directionDown": {
        top: theme.spacing(13),
        right: theme.spacing(4),
      },
    },
    "@media (max-width: 480px)": {
      speedDial: {
        position: "relative",
        "&.MuiSpeedDial-directionDown": {
          top: theme.spacing(1),
          right: theme.spacing(-2),
        },
      },
    },
  })
);

interface IReportSummary {
  id: number;
  name: string;
  submitted: boolean;
}

const actions = [
  {
    icon: <EditIcon color="primary" />,
    name: "Edit Group",
    operation: "Edit Group",
  },
  {
    icon: <EventIcon color="primary" />,
    name: "New Event",
    operation: "New Event",
  }
];

export default function Details() {
  let { groupId } = useParams<any>();
  const history = useHistory();
  const [dialog, setDialog] = useState<boolean>(false);
  const [report, setNewReport] = useState<boolean>(false);
  const [event, setNewEvent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IGroup | null>(null);
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const profile = useSelector((state: IState) => state.core.user);
  const classes = useStyles();
  let count = 0;
  let mcReportSummary: IReportSummary[] = [];

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
    const userId = `${profile.id}`;
    const _leaderIds: number[] = data?.leaders || [];
    const leaderIds: string[] = _leaderIds.map((it) => `${it}`);

    const isLeader = leaderIds.indexOf(userId) > -1;

    return isLeader || hasAnyRole(profile, [appRoles.roleGroupEdit]);
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

  function handleNewReport() {
    setNewReport(true);
  }

  function handleNewReportClose() {
    setNewReport(false);
  }

  const createEventTitle = "New Event";
  const createReportTitle = "New Report";

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
    } else if (operation === "New Report") {
      handleNewReport();
    }
    setOpen(!open);
  };

  const handleShow = () => {
    setShow(!show)
  }

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
      component: (
        <GroupEventsList childEvents={data.childEvents ? data.childEvents : []} />
      ),
    });
    tabs.push({
      name: "Pending requests",
      component: <MemberRequests group={data} />,
    });
  }

  const getReports = () => {
    if (data.childEvents === undefined || data.children === undefined) {
      return false
    }

    data.children.map((it : any) => {
      mcReportSummary.push({id: it.id, name: it.name, submitted: false})
    })
    
    data.childEvents.map((it: any) => {
      if (isThisWeek(new Date(it.startDate)) && it.category.name === EventCategory.WeeklyMC) {
        mcReportSummary.map((r: any) => {
          if (r.id === it.group.id) {
            r.submitted = true;
          }
        })
        count++;
      }
    })
    return true; 
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
              },
              {
                path: localRoutes.groups,
                label: "Groups",
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
                <Typography variant="body1">{`${data.privacy}, ${data.category.name}`}</Typography>
                <Typography variant="overline">{`Attendance This Month: ${data.totalAttendance} (${data.averageAttendance}%)`}</Typography>
              </Box>

              {isLeader() ? (
                <Box pr={2} flexGrow={1}>
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
                </Box>
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
          {getReports() && isLeader() && data.categoryId === GroupCategory.Cohort || data.categoryId === GroupCategory.Location ? 
            (<Grid item xs={12}>
              <Box display="flex" flexDirection="column">
                <Alert 
                  severity={count === data.children?.length ? "success" : "warning"}
                  action={
                    <Button onClick={handleShow}>
                      {show ? "Close Details" : "View Details"}
                    </Button>
                  }
                >
                  <AlertTitle>{`${count}/${data.children?.length} MC Reports Submitted`}</AlertTitle>
                  <Collapse in={show}>
                    <List>
                      {
                        mcReportSummary.map((it: any) => {
                          return (
                            <ListItem 
                              key={it.id} 
                              button 
                              onClick={
                                () => history.push(`${localRoutes.groups}/${it.id}`)}
                            >
                              <ListItemIcon>
                                { it.submitted ? 
                                  <CheckCircleOutlineIcon style={{ color: green[500] }}/>  
                                  : <HighlightOffIcon style={{ color: red[500] }}/> }
                              </ListItemIcon>
                              <ListItemText>
                                <Typography variant="body1">{it.name}</Typography>  
                              </ListItemText>
                            </ListItem>                
                          )
                        })
                      }
                    </List>
                  </Collapse>
                </Alert>
              </Box>
            </Grid>) : (undefined)}
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
          />
        </EditDialog>
        <EditDialog
          title={createEventTitle}
          open={event}
          onClose={handleNewEventClose}
        >
          <EventForm
            data={{ group: { id: data.id, name: data.name } }}
            isNew={true}
            onCreated={handleNewEventClose}
          />
        </EditDialog>
        <EditDialog
          title={createReportTitle}
          open={report}
          onClose={handleNewReportClose}
        >
          <ReportForm
            data={{ group: { id: data.id, name: data.name } }}
            isNew={true}
            onCreated={handleNewReportClose}
          />
        </EditDialog>
      </Box>
    </Layout>
  );
}
