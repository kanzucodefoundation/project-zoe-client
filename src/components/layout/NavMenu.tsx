import React, { Fragment } from 'react';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppsIcon from '@material-ui/icons/Apps';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import grey from '@material-ui/core/colors/grey';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { hasAnyRole } from '../../data/appRoles';
import { navBackgroundColor } from './styles';
import { appPermissions, localRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { hasValue } from '../inputs/inputHelpers';

interface IAppRoute {
  requiredRoles?: string[];
  name: string;
  route?: string;
  icon?: any;
  items?: IAppRoute[];
}

const routes: IAppRoute[] = [
  {
    // requiredRoles: [appRoles.roleDashboard],
    name: 'Dashboard',
    route: localRoutes.dashboard,
    icon: AppsIcon,
  },
  // {
  //   name: 'My Profile',
  //   route: localRoutes.profile,
  //   icon: PersonIcon,
  // },
  // {
  //   name: 'Calendar',
  //   route: localRoutes.calendar,
  //   icon: TodayIcon,
  // },
  // {
  //   name: 'Connect',
  //   route: localRoutes.chat,
  //   icon: ChatIcon,
  // },
  {
    requiredRoles: [appPermissions.roleCrmView, appPermissions.roleCrmEdit],
    name: 'People',
    route: localRoutes.contacts,
    icon: PeopleIcon,
  },
  {
    requiredRoles: [appPermissions.roleGroupView, appPermissions.roleGroupEdit],
    name: 'Groups',
    route: localRoutes.groups,
    icon: BubbleChartIcon,
  },
  // {
  // name:"Events",
  // route:localRoutes.eventActivities,
  // icon:EventIcon,

  // },
  {
    requiredRoles: [appPermissions.roleReportView],
    name: 'Reports',
    route: localRoutes.reports,
    icon: AssessmentIcon,
    items: [
      {
        name: 'Salvations',
        route: localRoutes.reportSalvations,
      },
    ],
  },
  {
    requiredRoles: [appPermissions.roleUserView, appPermissions.roleUserEdit],
    name: 'Admin',
    route: localRoutes.settings,
    icon: SettingsIcon,
    items: [
      {
        name: 'Manage Users',
        route: localRoutes.users,
      },
      {
        name: 'Group Categories',
        route: localRoutes.groupsCategories,
      },
      {
        name: 'Event Categories',
        route: localRoutes.eventCategories,
      },
      { name: 'Event Fields', route: localRoutes.reportCategories },
      {
        name: 'Settings',
        route: localRoutes.settings,
      },
      {
        name: 'Manage Help',
        route: localRoutes.manageHelp,
      },
    ],
  },
  // {
  //   name: 'Help',
  //   route: localRoutes.help,
  //   icon: HelpIcon,
  // },
];
const menBackgroundColor = grey[800];
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    logoHolder: {
      height: 140,
    },
    logo: {
      [theme.breakpoints.only('xs')]: {
        height: 50,
        width: 'auto',
      },
      height: 58,
      width: 'auto',
      fontSize: '25px',
      color: 'white',
    },
    whiteText: {
      color: 'white',
    },
    menuItem: {
      '&:hover': {
        backgroundColor: menBackgroundColor,
      },
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  }),
);

const StyledListItem = withStyles({
  root: {
    '&$selected': {
      backgroundColor: menBackgroundColor,
    },
  },
  selected: {},
})(ListItem);

const NavMenu = (props: any) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [open, setOpen] = React.useState<any>({});
  const user = useSelector((state: IState) => state.core.user);
  const handleMenuClick = (name: string) => () => {
    const menuData = { ...open, [name]: !open[name] };
    setOpen(menuData);
  };

  const onClick = (path: string) => () => {
    const { onClose } = props;
    history.push(path);
    if (onClose) onClose();
  };
  const pathMatches = (path: string, str: string) => path.indexOf(str) > -1;

  const isSelected = (pathStr: string): boolean => {
    const { pathname } = location;
    return pathMatches(pathname, pathStr);
  };

  const cleanRoutes = (r: IAppRoute[]) =>
    r.filter((it) => {
      let { items } = it;
      if (items && hasValue(items)) {
        items = cleanRoutes(items);
      }
      return it.requiredRoles ? hasAnyRole(user, it.requiredRoles) : true;
    });

  const finalRoutes = cleanRoutes(routes);

  return (
    <div style={{ backgroundColor: navBackgroundColor }}>
      <Grid
        className={classes.logoHolder}
        container
        spacing={0}
        alignContent="center"
        justify="center"
      >
        <h3 className={classes.logo}>Project Zoe</h3>
      </Grid>
      <Divider />
      <List style={{ paddingTop: 0 }}>
        {finalRoutes.map((it) => {
          const Icon = it.icon;
          if (it.items) {
            return (
              <Fragment key={it.name}>
                <StyledListItem button onClick={handleMenuClick(it.name)}>
                  <ListItemIcon>
                    <Icon className={classes.whiteText} />
                  </ListItemIcon>
                  <ListItemText
                    primary={it.name}
                    className={classes.whiteText}
                  />
                  {open[it.name] ? (
                    <ExpandLess className={classes.whiteText} />
                  ) : (
                    <ExpandMore className={classes.whiteText} />
                  )}
                </StyledListItem>
                <Collapse
                  in={open[it.name] || isSelected(it.name.toLocaleLowerCase())}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {it.items.map((ch) => (
                      <StyledListItem
                        button
                        onClick={onClick(ch.route!)}
                        selected={isSelected(ch.route!)}
                        key={ch.name}
                        className={classes.menuItem}
                        classes={{
                          selected: classes.menuItem,
                        }}
                      >
                        <ListItemText
                          inset
                          primary={ch.name}
                          className={classes.whiteText}
                        />
                      </StyledListItem>
                    ))}
                  </List>
                </Collapse>
              </Fragment>
            );
          }
          return (
            <StyledListItem
              button
              onClick={onClick(it.route!)}
              selected={isSelected(it.route!)}
              key={it.name}
              className={classes.menuItem}
              classes={{
                selected: classes.menuItem,
              }}
            >
              <ListItemIcon>
                <Icon className={classes.whiteText} />
              </ListItemIcon>
              <ListItemText primary={it.name} className={classes.whiteText} />
            </StyledListItem>
          );
        })}
      </List>
    </div>
  );
};

export default NavMenu;
