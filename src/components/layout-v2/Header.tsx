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
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { layout } from '../../theme-wh/tokens';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import ColorModeIconDropdown from './ColorModeIconDropdown';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../data/store';
import { logout } from '../../data/coreSlice';
import { get } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import NotificationBell from '../../modules/notifications/NotificationBell';
import { useAuthToken } from '../../hooks/useAuthToken';
import { useNotificationSocket } from '../../data/useNotificationSocket';

interface LocationGroup {
  id: number;
  name: string;
  parentId?: number;
  category?: { purpose?: string };
}

interface HeaderProps {
  /** Only rendered while the rail is collapsed. */
  onExpandSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export default function Header({
  onExpandSidebar,
  sidebarCollapsed = false,
}: HeaderProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);
  const token = useAuthToken();
  useNotificationSocket(token);

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

  // A person sits in a chain of location groups -- country, region, church,
  // cell -- and every one of them has purpose 'location'. Only the deepest
  // says where they actually are, so parents of another entry are dropped.
  const ownLocation = (() => {
    const parentIds = new Set(
      userLocations.map((l) => l.parentId).filter(Boolean),
    );
    const leaves = userLocations.filter((l) => !parentIds.has(l.id));
    return (leaves.length > 0 ? leaves : userLocations)
      .map((l) => l.name)
      .join(', ');
  })();

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
        height: layout.topbarHeight,
        justifyContent: 'center',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          mx: 'auto',
          minHeight: `${layout.topbarHeight}px !important`,
          px: { xs: 2.5, sm: 3, lg: 4 },
        }}
      >
        <Stack
          direction="row"
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          spacing={2}
        >
          <Stack
            direction="row"
            sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}
          >
            {sidebarCollapsed && onExpandSidebar && (
              <Tooltip title="Expand sidebar">
                <IconButton
                  onClick={onExpandSidebar}
                  aria-label="Expand sidebar"
                  size="small"
                >
                  <MenuRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <NavbarBreadcrumbs />
          </Stack>
          <Stack
            direction="row"
            sx={{
              gap: 0.5,
              alignItems: 'center',
              '& .MuiIconButton-root': { color: 'text.primary' },
            }}
          >
            <NotificationBell />
            <ColorModeIconDropdown />
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 0.75, my: 1.25 }}
            />
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                aria-label="Account menu"
                sx={{ p: 0.25 }}
              >
              <Avatar
                variant="rounded"
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() ||
                  user?.fullName?.charAt(0)?.toUpperCase() ||
                  'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
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
              <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {user?.fullName || user?.username || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.email || user?.username || ''}
                </Typography>
                {ownLocation && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 0.75,
                      color: 'text.secondary',
                    }}
                  >
                    <LocationOnRoundedIcon sx={{ fontSize: 15 }} />
                    <Typography variant="caption" noWrap>
                      {ownLocation}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose();
                  navigate(localRoutes.profile);
                }}
              >
                <ListItemIcon>
                  <PersonOutlineRoundedIcon fontSize="small" />
                </ListItemIcon>
                My profile
              </MenuItem>
              <Divider />
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