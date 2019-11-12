import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppsIcon from '@material-ui/icons/Apps';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';
import {withRouter} from 'react-router'
import {localRoutes} from "../data/constants";
import grey from '@material-ui/core/colors/grey';
import {BarView} from "./Profile";
import logo from "../assets/logo.png";
import {themeBackground} from "../theme/custom-colors";
import Paper from "@material-ui/core/Paper";
import {blueGrey} from "@material-ui/core/colors";

const drawerWidth = 240;
const navBackgroundColor = blueGrey[50];
export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            height: "100%",
            width: "100%"
        },
        drawer: {
            backgroundColor: navBackgroundColor,
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        appBar: {
            backgroundColor: themeBackground,
            marginLeft: drawerWidth,
            zIndex: theme.zIndex.drawer + 1,
        },
        title: {
            flexGrow: 1,
        },
        menuButton: {
            color: grey[50],
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
        },
        toolbar: {
            ...theme.mixins.toolbar,
        },
        drawerPaper: {
            width: drawerWidth,
            backgroundColor: navBackgroundColor,
        },
        content: {
            flexGrow: 1,
            height: "100%",
        },
        body: {
            backgroundColor: grey[50],
            padding: theme.spacing(2),
            [theme.breakpoints.only('xs')]: {
                padding: 0,
            },
            height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
            [theme.breakpoints.up('sm')]: {
                height: `calc(100% - 64px)`
            },
            overflow: 'auto'
        },
        logoHolder: {
            flexGrow: 1,
        },
        logo: {
            [theme.breakpoints.only('xs')]: {
                height: 50,
                width: 'auto',
            },
            height: 58,
            width: 'auto',
        },
        menu: {
            color: grey[500]
        },

        drawerOpen: {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerClose: {
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: theme.spacing(7) + 1,
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9) + 1,
            },
        },
    }),
);

function Layout(props: any) {
    const classes = useStyles();
    const theme = useTheme();

    const [mobileOpen, setMobileOpen] = React.useState(false);

    function handleDrawerToggle() {
        setMobileOpen(!mobileOpen);
    }

    const onClick = (path: string) => () => {
        const {history, onClose} = props
        history.push(path)
        if (onClose)
            onClose()
    }

    const pathMatches = (path: string, str: string) => path.indexOf(str) > -1

    const isSelected = (pathStr: string): boolean => {
        const {match: {path}} = props
        return pathMatches(path, pathStr)
    }


    const drawer = (
        <div style={{backgroundColor: navBackgroundColor}}>
            <div className={classes.toolbar}>
                <div className={classes.logoHolder}>
                    <img src={logo} alt="logo" className={classes.logo}/>
                </div>
            </div>
            <Divider/>
            <List>
                <ListItem button onClick={onClick(localRoutes.dashboard)} selected={isSelected(localRoutes.dashboard)}>
                    <ListItemIcon>
                        <AppsIcon/>
                    </ListItemIcon>
                    <ListItemText primary='Dashboard'/>
                </ListItem>
                <ListItem button onClick={onClick(localRoutes.contacts)} selected={isSelected(localRoutes.contacts)}>
                    <ListItemIcon>
                        <PeopleIcon/>
                    </ListItemIcon>
                    <ListItemText
                        primary='Contacts'/>
                </ListItem>
                <ListItem button onClick={onClick(localRoutes.settings)} selected={isSelected(localRoutes.settings)}>
                    <ListItemIcon>
                        <SettingsIcon/>
                    </ListItemIcon>
                    <ListItemText primary='Settings'/>
                </ListItem>
            </List>
        </div>
    );

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
                    <div className={classes.logoHolder}>
                        <img src={logo} alt="logo" className={classes.logo}/>
                    </div>
                    <BarView/>
                </Toolbar>
            </AppBar>
            <nav className={classes.drawer} aria-label="mailbox folders">
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Hidden smUp implementation="css">
                    <Drawer
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open={false}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
            <main className={classes.content}>
                <div className={classes.toolbar}/>
                <Paper className={classes.body}>
                    {props.children}
                </Paper>
            </main>
        </div>
    );
}

export default withRouter(Layout)
