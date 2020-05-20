import React from 'react';
import LeftNavigation from '@storybook/react/demo';
import { makeStyles } from '@material-ui/core/styles';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CssBaseline from "@material-ui/core/CssBaseline";

export default {
  title: 'LeftNavigation',
  component: LeftNavigation,
};

const theme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#0097A7',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      light: '#0066ff',
      main: '#0044ff',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#ffcc00',
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
  typography: {
    fontSize: 11,
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export const LeftNavigationMenu = () => {
  const classes = useStyles();
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
  );
}