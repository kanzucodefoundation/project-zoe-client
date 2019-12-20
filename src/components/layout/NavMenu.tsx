import React, { Fragment } from 'react';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppsIcon from '@material-ui/icons/Apps';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpIcon from '@material-ui/icons/Help';
import {useHistory, useLocation} from 'react-router-dom'
import {localRoutes} from "../../data/constants";
import appLogo from "../../assets/cool.png";
import {navBackgroundColor} from "./styles";
import {createStyles, makeStyles, Theme, withStyles} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import grey from '@material-ui/core/colors/grey';

import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';


interface IProps {
}

const routes = [
    {
        name: "Dashboard",
        route: localRoutes.dashboard,
        icon: AppsIcon
    },
    {
        name: "People",
        icon: PeopleIcon,
        items: [
            {
                name: "Contacts",
                route: localRoutes.contacts
            },
            {
                name: "Groups",
                route: localRoutes.groups
            }
        ]
    },
    {
        name: "Admin",
        route: localRoutes.settings,
        icon: SettingsIcon,
        items: [
            {
                name: "Users",
                route: localRoutes.users
            },
            {
                name: "User Groups",
                route: localRoutes.usersGroups
            },
            {
                name: "Settings",
                route: localRoutes.settings
            },
        ]
    },
    {
        name: "Help",
        route: localRoutes.help,
        icon: HelpIcon
    }
]
const menBackgroundColor = grey[800]
const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        logoHolder: {
            height: 140
        },
        logo: {
            [theme.breakpoints.only('xs')]: {
                height: 50,
                width: 'auto',
            },
            height: 58,
            width: 'auto',
        },
        whiteText: {
            color: 'white'
        },
        menuItem: {
            "&:hover": {
                backgroundColor: menBackgroundColor,
            }
        },
        nested: {
            paddingLeft: theme.spacing(4),
        },
    }),
);


const StyledListItem = withStyles({
    root: {
        "&$selected": {
            backgroundColor: menBackgroundColor
        }
    },
    selected: {}
})(ListItem)

const NavMenu = (props: any) => {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
    const [open, setOpen] = React.useState<any>({});

    const handleMenuClick = (name: string) => () => {
        const menuData = {...open, [name]: !open[name]}
        setOpen(menuData);
    };

    const onClick = (path: string) => () => {
        const {onClose} = props
        history.push(path)
        if (onClose)
            onClose()
    }
    const pathMatches = (path: string, str: string) => path.indexOf(str) > -1

    const isSelected = (pathStr: string): boolean => {
        const {pathname} = location
        return pathMatches(pathname, pathStr)
    }

    return (
        <div style={{backgroundColor: navBackgroundColor}}>
            <Grid className={classes.logoHolder}
                  container
                  spacing={0}
                  alignContent='center'
                  justify='center'>
                <img src={appLogo} alt="logo" className={classes.logo}/>
            </Grid>
            <Divider/>
            <List style={{paddingTop: 0}}>
                {
                    routes.map(it => {
                        const Icon = it.icon
                        if (it.items) {
                            return <Fragment key={it.name}>
                                <StyledListItem button onClick={handleMenuClick(it.name)}>
                                    <ListItemIcon>
                                        <Icon className={classes.whiteText}/>
                                    </ListItemIcon>
                                    <ListItemText primary={it.name} className={classes.whiteText}/>
                                    {open[it.name] ? <ExpandLess className={classes.whiteText}/> :
                                        <ExpandMore className={classes.whiteText}/>}
                                </StyledListItem>
                                <Collapse in={open[it.name] || isSelected(it.name.toLocaleLowerCase())} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {
                                            it.items.map(ch => <StyledListItem
                                                button
                                                onClick={onClick(ch.route)}
                                                selected={isSelected(ch.route)}
                                                key={ch.name}
                                                className={classes.menuItem}
                                                classes={{
                                                    selected: classes.menuItem
                                                }}
                                            >
                                                <ListItemText inset primary={ch.name} className={classes.whiteText}/>
                                            </StyledListItem>)
                                        }
                                    </List>
                                </Collapse>
                            </Fragment>
                        }
                        return <StyledListItem
                            button
                            onClick={onClick(it.route)}
                            selected={isSelected(it.route)}
                            key={it.name}
                            className={classes.menuItem}
                            classes={{
                                selected: classes.menuItem
                            }}
                        >
                            <ListItemIcon>
                                <Icon className={classes.whiteText}/>
                            </ListItemIcon>
                            <ListItemText primary={it.name} className={classes.whiteText}/>
                        </StyledListItem>
                    })
                }
            </List>
        </div>
    );
}


export default NavMenu;
