import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from './ColorModeIconDropdown';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../data/store';
import { logout } from '../../data/coreSlice';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface LocationGroup {
  id: number;
  name: string;
  category?: { purpose?: string };
}

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.core);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userLocations, setUserLocations] = useState<LocationGroup[]>([]);

  useEffect(() => {
    get(
      remoteRoutes.groupsMyGroups,
      (response: LocationGroup[]) => {
        setUserLocations(
          (response || []).filter((g) => g.category?.purpose === 'location'),
        );
      },
      () => {},
    );
  }, []);

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
      position="sticky"
      sx={{
        display: { xs: 'none', md: 'block' },
        boxShadow: 0,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          width: '100%',
          maxWidth: { sm: '100%', md: '1700px' },
          mx: 'auto',
          px: 3,
        }}
      >
        <Stack
          direction="row"
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            pb: 1.5,
          }}
          spacing={2}
        >
          <NavbarBreadcrumbs />
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <MenuButton showBadge aria-label="Open notifications">
              <NotificationsRoundedIcon />
            </MenuButton>
            <ColorModeIconDropdown />
            {/* User Profile Menu */}
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{
                ml: 0.5,
                p: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() ||
                  user?.fullName?.charAt(0)?.toUpperCase() ||
                  'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {userLocations.length > 0 && (
                <>
                  <MenuItem
                    disabled
                    sx={{ opacity: '1 !important', pointerEvents: 'none' }}
                  >
                    <ListItemIcon>
                      <LocationOnRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" color="text.secondary">
                      {userLocations.map((l) => l.name).join(', ')}
                    </Typography>
                  </MenuItem>
                  <Divider />
                </>
              )}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
