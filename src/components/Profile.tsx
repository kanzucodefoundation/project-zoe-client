import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Typography from '@material-ui/core/Typography';
import { useDispatch, useSelector } from 'react-redux';
import HiddenJs from '@material-ui/core/Hidden/HiddenJs';
import { useHistory } from 'react-router';
import { IState } from '../data/types';
import { IPersonState } from '../modules/contacts/types';
import { getInitials } from '../utils/stringHelpers';
import { handleLogout } from '../data/coreActions';
import { localRoutes } from '../data/constants';

export const BarView = (props: any) => {
  const profile = useSelector((state: IState) => state.core.user);
  const user = useSelector((state: IPersonState) => state.core.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  function doLogout() {
    dispatch(handleLogout());
  }

  function handleMenu(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  function goToProfile() {
    history.push(localRoutes.profile);
  }

  return <div>
        <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
        >
            <AccountCircle className={props.textClass}/>
            &nbsp;
            <HiddenJs xsDown>
                <Typography className={props.textClass}>{profile.fullName}</Typography>
            </HiddenJs>
            <HiddenJs smUp>
                <Typography className={props.textClass}>{getInitials(profile.fullName)}</Typography>
            </HiddenJs>
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
            open={menuOpen}
            onClose={handleCloseMenu}
        >
            <MenuItem onClick={goToProfile}>Profile</MenuItem>
            <MenuItem onClick={doLogout}>Logout</MenuItem>
        </Menu>
    </div>;
};
