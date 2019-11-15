import React from 'react';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppsIcon from '@material-ui/icons/Apps';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';
import {useHistory, useLocation} from 'react-router-dom'
import {localRoutes} from "../../data/constants";
import logo from "../../assets/logo.png";
import {navBackgroundColor} from "./styles";
import {createStyles, makeStyles, Theme, withStyles} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import grey from '@material-ui/core/colors/grey';
interface IProps {
}

const routes = [
    {
        name: "Dashboard",
        route: localRoutes.dashboard,
        icon: AppsIcon
    },
    {
        name: "Contacts",
        route: localRoutes.contacts,
        icon: PeopleIcon
    },
    {
        name: "Settings",
        route: localRoutes.settings,
        icon: SettingsIcon
    },
    {
        name: "Users",
        route: localRoutes.users,
        icon: SettingsIcon
    }
]
const menBackgroundColor= grey[800]
const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        logoHolder: {
          height:140
        },
        logo: {
            [theme.breakpoints.only('xs')]: {
                height: 50,
                width: 'auto',
            },
            height: 58,
            width: 'auto',
        },
        whiteText:{
            color:'white'
        },
        menuItem:{
            "&:hover": {
                backgroundColor:menBackgroundColor,
            }
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
                <img src={logo} alt="logo" className={classes.logo}/>
            </Grid>
            <Divider/>
            <List style={{paddingTop:0}}>
                {
                    routes.map(it=>{
                        const Icon = it.icon
                        return <StyledListItem
                            button
                            onClick={onClick(it.route)}
                            selected={isSelected(it.route)}
                            key={it.name}
                            className={classes.menuItem}
                            classes={{
                                selected:classes.menuItem
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
