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
import { Theme } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import EditIcon from "@material-ui/icons/Edit";
import EventIcon from '@material-ui/icons/Event';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import MembersList from "./members/MembersList";
import { grey } from "@material-ui/core/colors";
import { get } from "../../utils/ajax";
import { appRoles, localRoutes, remoteRoutes } from "../../data/constants";
import Loading from "../../components/Loading";
import { Alert, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import { useHistory, useParams } from "react-router";
import Layout from "../../components/layout/Layout";
import IconButton from "@material-ui/core/IconButton";
import MapLink from "../../components/MapLink";
import { IState } from "../../data/types";
import { hasAnyRole } from "../../data/appRoles";
import MemberRequests from "./members/MemberRequests";
import TabbedView from "./TabbedView";
import XBreadCrumbs from "../../components/XBreadCrumbs";
import NewReport from "./groupReports/NewReport";
import GroupEventsList from "./groupReports/GroupEventsList";
import EventForm from "../events/forms/EventForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      padding: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(1)
      }
    },
    largeIcon: {
      width: theme.spacing(6),
      height: theme.spacing(6)
    },

    rootPaper: {
      padding: theme.spacing(2),
      borderRadius: 0
    },
    description: {
      minHeight: 100,
      borderRadius: 5,
      backgroundColor: grey[100]
    },
    speedDial: {
        position: 'fixed',
        '&.MuiSpeedDial-directionDown': {
            top: theme.spacing(13),
            right: theme.spacing(4),
        }
    },
    '@media (max-width: 480px)': {
        speedDial:{
            position:'relative',
            '&.MuiSpeedDial-directionDown': {
                top: theme.spacing(1),
                right: theme.spacing(-2),
            }
        }
    }
  })
);

const actions = [
  { icon: <EditIcon color="primary" />, name: 'Edit Group', operation: 'Edit Group' },
  { icon: <EventIcon color="primary"/>, name: 'New Event', operation: 'New Event'},
  { icon: <NoteAddIcon color="primary" />, name: 'New Report', operation: 'New Report'},
];


export default function Details() {
  let { groupId } = useParams();
  const history = useHistory();
  const [dialog, setDialog] = useState<boolean>(false);
  const [report, setNewReport] = useState<boolean>(false)
  const [event, setNewEvent] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IGroup | null>(null);
  const [open, setOpen] = useState(false)
  const profile = useSelector((state: IState) => state.core.user);
  const classes = useStyles();

  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.groups}/${groupId}`,
      data => {
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
    const leaderIds: string[] = _leaderIds.map(it => `${it}`);

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

  function handleNewReport (){
      setNewReport(true)
  }

  function handleNewReportClose (){
      setNewReport(false)
  }

  function handleNewEvent (){
    setNewEvent(true)
  }

  function handleNewEventClose (){
    setNewEvent(false)
  }

  //handler function
  const handleIconClick = (operation:any)=>{
      if(operation==='Edit Group'){
        // do something 
        handleEdit()
        console.log('Edit clicked')
      }else if(operation==='New Report'){
        //do something else
        handleNewReport()
        console.log('New Report clicked')
      }else if(operation==='New Event'){
        //do something else
        handleNewEvent()
        console.log('New Event clicked')
      }
      setOpen(!open); //To close the speed dial
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
      component: <MembersList groupId={Number(groupId)} />
    }
  ];
  if (isLeader()) {
    tabs.push({
      name: "Pending requests",
      component: <MemberRequests group={data} />
    });
    tabs.push({
      name: "Events",
      component: <GroupEventsList />
    });
    tabs.push({
      name: "Reports",
      component: <MemberRequests group={data} />
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
                label: "Dashboard"
              },
              {
                path: localRoutes.groups,
                label: "Groups"
              }
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
                    direction='down'
                    color='primary'
                    FabProps={{
                      size: 'small',
                    }}
                  >
                    {actions.map((action) => (
                      <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipPlacement="left"
                        onClick={() => {handleIconClick(action.operation)}}
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
        <EditDialog open={report} onClose={handleNewReportClose} title='New Report'>
          <NewReport data={data} isNew={false}/>                 
        </EditDialog>
        <EditDialog open={event} onClose={handleNewEventClose} title='New Event'>
          <EventForm data={data} isNew={false}/>
        </EditDialog>
      </Box>
    </Layout>
  );
}
