import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../data/store';
import { logout } from '../../data/coreSlice';
import { localRoutes } from '../../data/constants';
import { drawerWidth } from './Sidebar';

interface HeaderProps {
  title?: string;
  onDrawerToggle: () => void;
}

export const Header = ({ title, onDrawerToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.core);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {title || 'Dashboard'}
        </Typography>

        {/* User Profile Menu */}
        <IconButton onClick={handleProfileMenuOpen} size="small">
          <Avatar sx={{ width: 32, height: 32 }}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={() => navigate(localRoutes.profile)}>
            Profile
          </MenuItem>
          <MenuItem onClick={() => navigate(localRoutes.settings)}>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
