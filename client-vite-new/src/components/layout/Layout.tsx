import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Group,
  Assessment,
  Settings,
  ExpandLess,
  ExpandMore,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../data/store';
import { logout } from '../../data/coreSlice';
import { localRoutes, appPermissions } from '../../data/constants';

const drawerWidth = 240;

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  requiredRoles?: string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    icon: <Dashboard />,
    path: localRoutes.dashboard,
  },
  {
    name: 'People',
    icon: <People />,
    path: localRoutes.contacts,
    requiredRoles: [appPermissions.roleCrmView, appPermissions.roleCrmEdit],
  },
  {
    name: 'Groups',
    icon: <Group />,
    path: localRoutes.groups,
    requiredRoles: [appPermissions.roleGroupView, appPermissions.roleGroupEdit],
  },
  {
    name: 'Reports',
    icon: <Assessment />,
    path: localRoutes.reports,
    requiredRoles: [appPermissions.roleReportView],
  },
  {
    name: 'Admin',
    icon: <Settings />,
    path: localRoutes.settings,
    requiredRoles: [appPermissions.roleUserView, appPermissions.roleUserEdit],
    children: [
      { name: 'Manage Users', icon: <People />, path: localRoutes.users },
      { name: 'Manage Reports', icon: <Assessment />, path: localRoutes.reportConfiguration },
      { name: 'Group Categories', icon: <Group />, path: localRoutes.groupsCategories },
      { name: 'Settings', icon: <Settings />, path: localRoutes.settings },
    ],
  },
];

// Helper function to check if user has required roles
const hasRequiredRoles = (user: any, requiredRoles?: string[]) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  // For now, allow access to all menus if user is logged in
  // TODO: Implement proper role checking when backend provides roles
  if (!user) return false;
  return true;
  // Uncomment this when backend provides proper roles:
  // if (!user?.roles) return false;
  // return requiredRoles.some(role => user.roles.includes(role));
};

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.core);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuToggle = (menuName: string) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

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

  // Filter navigation items based on user roles
  const filteredNavItems = navItems.filter(item => 
    hasRequiredRoles(user, item.requiredRoles)
  );

  const isSelected = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const selected = isSelected(item.path);
    
    if (item.children) {
      const isOpen = openMenus[item.name] || selected;
      
      return (
        <div key={item.name}>
          <ListItem disablePadding sx={{ pl: level * 2 }}>
            <ListItemButton onClick={() => handleMenuToggle(item.name)} selected={selected}>
              <ListItemIcon sx={{ color: selected ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        </div>
      );
    }

    return (
      <ListItem key={item.name} disablePadding sx={{ pl: level * 2 }}>
        <ListItemButton
          selected={selected}
          onClick={() => handleNavigate(item.path)}
        >
          <ListItemIcon sx={{ color: selected ? 'primary.main' : 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.name} />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Project Zoe
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavItems.map(item => renderNavItem(item))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
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
            onClick={handleDrawerToggle}
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
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;