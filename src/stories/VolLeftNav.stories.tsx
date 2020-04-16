// import React from 'react';
// import VolLeftNav from '@storybook/react/demo';
// import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
// import Container from '@material-ui/core/Container';
// import Typography from '@material-ui/core/Typography';
// import Box from '@material-ui/core/Box';

// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemText from '@material-ui/core/ListItemText';
// import Collapse from '@material-ui/core/Collapse';
// import ExpandLess from '@material-ui/icons/ExpandLess';
// import ExpandMore from '@material-ui/icons/ExpandMore';
// import CssBaseline from "@material-ui/core/CssBaseline";

// export default {
//   title: 'VolLeftNav',
//   component: VolLeftNav,
// };



// export const LeftNavigationMenu = () => {
//   const [openVolunteers, setOpenVolunteers] = React.useState(true);
//   const [openTasks, setOpenTasks] = React.useState(true);

//   const handleVolunteersClick = () => {
//     setOpenVolunteers(!openVolunteers);
//   };

//   const handleTasksClick = () => {
//     setOpenTasks(!openTasks);
//   };

//   const leftNavBar = createMuiTheme({
//     palette: {
//       background: {
//         default: '#212121'
//       },
//       text: {
//         primary: '#ffffff',
//       },
//     },
//     typography: {
//       fontSize: 11,
//     },
//   });
  
//   return (
//     <MuiThemeProvider theme={leftNavBar}>
//       <CssBaseline />
//       <Container>
//         <Typography component="div">
//           <h1><Box fontSize={19} fontWeight={100}>angie</Box></h1>
//           <List component="nav">
//             <ListItem button>
//               <ListItemText><Box fontSize={15} fontWeight={900}>Trial</Box></ListItemText>
//             </ListItem>
//             <ListItem button>
//               <ListItemText><Box fontSize={15} fontWeight={900}>Calendar</Box></ListItemText>
//             </ListItem>
//             <ListItem button onClick={handleVolunteersClick}>
//               <ListItemText><Box fontSize={15} fontWeight={900}>Volunteers</Box></ListItemText>
//               {openVolunteers ? <ExpandLess /> : <ExpandMore />}
//             </ListItem>
//             <Collapse in={openVolunteers} timeout="auto" unmountOnExit>
//               <List component="div" disablePadding>
//                 <ListItem button>
//                   <ListItemText primary="- View volunteers" />
//                 </ListItem>
//                 <ListItem button>
//                   <ListItemText primary="- Add volunteers" />
//                 </ListItem>
//                 <ListItem button>
//                   <ListItemText primary="- Edit volunteers" />
//                 </ListItem>
//               </List>
//             </Collapse>
//             <ListItem button onClick={handleTasksClick}>
//               <ListItemText><Box fontSize={15} fontWeight={900}>Tasks</Box></ListItemText>
//               {openTasks ? <ExpandLess /> : <ExpandMore />}
//             </ListItem>
//             <Collapse in={openTasks} timeout="auto" unmountOnExit>
//               <List component="div" disablePadding>
//                 <ListItem button>
//                   <ListItemText primary="- View tasks" />
//                 </ListItem>
//                 <ListItem button>
//                   <ListItemText primary="- Add tasks" />
//                 </ListItem>
//                 <ListItem button>
//                   <ListItemText primary="- Edit tasks" />
//                 </ListItem>
//               </List>
//             </Collapse>
//           </List>
//         </Typography>
//       </Container>
//     </MuiThemeProvider>
//   );
// }




import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import {BarView} from "../components/Profile";
import Paper from "@material-ui/core/Paper";
import {useStyles} from "../components/layout/styles";
import NavMenu from "../components/layout/NavMenu";
import {Typography} from "@material-ui/core";


export default {
  title: 'VolLeftNav'
};


interface IProps {
    title?: string
    children?: any,
    mobilePadding?: boolean
}

export function Layout(props: IProps) {
    const classes = useStyles();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    function handleDrawerToggle() {
        setMobileOpen(!mobileOpen);
    }

    return (
        <div className={classes.root}>
            <CssBaseline/>
            <AppBar position="fixed" className={classes.appBar} color='default'>
                <Toolbar>
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" noWrap className={classes.title}>
                        {props.title}
                    </Typography>
                    <BarView/>
                </Toolbar>
            </AppBar>
            <nav className={classes.drawer} aria-label="mailbox folders">
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Hidden mdUp implementation="css">
                    <Drawer
                        variant="temporary"
                        anchor={'left'}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        <NavMenu/>
                    </Drawer>
                </Hidden>
                <Hidden smDown implementation="css">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open={false}
                    >
                        <NavMenu/>
                    </Drawer>
                </Hidden>
            </nav>
            <main className={classes.content}>
                <div className={classes.toolbar}/>
                <Paper className={classes.body} >
                    {props.children}
                </Paper>
            </main>
        </div>
    );
}

// export default Layout
