import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  Appointments,
} from '@devexpress/dx-react-scheduler-material-ui';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';


import VolLeftNav from '@storybook/react/demo';
// import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
// import Container from '@material-ui/core/Container';
// import Typography from '@material-ui/core/Typography';
// import Box from '@material-ui/core/Box';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CssBaseline from "@material-ui/core/CssBaseline";

const calendar = createMuiTheme({
  palette: {
    background: {
      default: '#212121'
    },
    text: {
      primary: '#ffffff',
    },
  },
  typography: {
    fontSize: 11,
  },
});


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

const currentDate = '2020-04-07';
const schedulerData = [
  { startDate: '2020-04-07T09:45', endDate: '2020-04-07T11:00', title: 'Cleaning the church' },
  { startDate: '2020-04-07T12:00', endDate: '2020-04-07T15:30', title: 'Setting up the cameras' },
  { startDate: '2020-04-08T03:45', endDate: '2020-04-08T06:00', title: 'Cleaning the church' },
  { startDate: '2020-04-09T12:00', endDate: '2020-04-09T13:30', title: 'Setting up the cameras' },
  { startDate: '2020-04-10T04:45', endDate: '2020-04-10T07:00', title: 'Cleaning the church' },
  { startDate: '2020-04-11T01:00', endDate: '2020-04-11T03:30', title: 'Setting up the cameras' },
];

export default {
    title: 'VolViewCalendar'
  };
  

    export function Calendar() {
      const classes = useStyles();
      const [auth, setAuth] = React.useState(true);
      const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
      const open = Boolean(anchorEl);
    
      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAuth(event.target.checked);
      };
    
      const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
      };
    
      const handleClose = () => {
        setAnchorEl(null);
      };
    

      const [openVolunteers, setOpenVolunteers] = React.useState(true);
      const [openTasks, setOpenTasks] = React.useState(true);
    
      const handleVolunteersClick = () => {
        setOpenVolunteers(!openVolunteers);
      };
    
      const handleTasksClick = () => {
        setOpenTasks(!openTasks);
      };
    
      const leftNavBar = createMuiTheme({
        palette: {
          background: {
            default: '#212121'
          },
          text: {
            primary: '#ffffff',
          },
        },
        typography: {
          fontSize: 11,
        },
      });
      

      return (
    <MuiThemeProvider theme={calendar}>
      
      <Container>
        <Typography component="div">
          <h1><Box fontSize={19} fontWeight={100}>angie</Box></h1>
          <div className={classes.root}>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={auth} onChange={handleChange} aria-label="login switch" />}
          label={auth ? 'Logout' : 'Login'}
        />
      </FormGroup>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Photos
          </Typography>
          {auth && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
    

  <Paper>
    <Scheduler
      data={schedulerData}
    
    >
      
      <ViewState
        currentDate={currentDate}
       
      />
      <WeekView
        startDayHour={1}
        endDayHour={24}
      />
      <Appointments />
    </Scheduler>
  </Paper>

  <MuiThemeProvider theme={leftNavBar}>
      <CssBaseline />
      <Container>
        <Typography component="div">
          <h1><Box fontSize={19} fontWeight={100}>angie</Box></h1>
          <List component="nav">
            <ListItem button>
              <ListItemText><Box fontSize={15} fontWeight={900}>Trial</Box></ListItemText>
            </ListItem>
            <ListItem button>
              <ListItemText><Box fontSize={15} fontWeight={900}>Calendar</Box></ListItemText>
            </ListItem>
            <ListItem button onClick={handleVolunteersClick}>
              <ListItemText><Box fontSize={15} fontWeight={900}>Volunteers</Box></ListItemText>
              {openVolunteers ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openVolunteers} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button>
                  <ListItemText primary="- View volunteers" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="- Add volunteers" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="- Edit volunteers" />
                </ListItem>
              </List>
            </Collapse>
            <ListItem button onClick={handleTasksClick}>
              <ListItemText><Box fontSize={15} fontWeight={900}>Tasks</Box></ListItemText>
              {openTasks ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openTasks} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button>
                  <ListItemText primary="- View tasks" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="- Add tasks" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="- Edit tasks" />
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Typography>
      </Container>
    </MuiThemeProvider>
  </Typography>
      </Container>
    </MuiThemeProvider>
)}
