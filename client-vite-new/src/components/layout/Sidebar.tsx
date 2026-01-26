import { useState } from 'react';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  People,
  Group,
  Assessment,
  Settings,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { localRoutes, appPermissions } from '../../data/constants';
import type {$TsFixMe} from "../../utils/types.ts";

export const drawerWidth = 280;

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
const hasRequiredRoles = (user: $TsFixMe, requiredRoles?: string[]) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  // For now, allow access to all menus if user is logged in
  // TODO: Implement proper role checking when backend provides roles
  if (!user) return false;
  return true;
  // Uncomment this when backend provides proper roles:
  // if (!user?.roles) return false;
  // return requiredRoles.some(role => user.roles.includes(role));
};

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.core);

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const handleMenuToggle = (menuName: string) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onMobileClose();
    }
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
    const isNested = level > 0;

    if (item.children) {
      const isOpen = openMenus[item.name] || selected;

      return (
        <div key={item.name}>
          <ListItem disablePadding sx={{ pl: level * 2 }}>
            <ListItemButton
              onClick={() => handleMenuToggle(item.name)}
              selected={selected}
              sx={{
                py: 1.5,
                px: 2,
                minHeight: 56,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selected ? 'primary.main' : 'inherit',
                  minWidth: 40,
                  '& svg': {
                    fontSize: isNested ? 20 : 24,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontSize: isNested ? 15 : 16,
                  fontWeight: selected ? 600 : 500,
                  letterSpacing: 0.15,
                }}
              />
              <Box sx={{ ml: 'auto' }}>
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </Box>
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
          sx={{
            py: 1.5,
            px: 2,
            minHeight: 56,
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.selected',
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: selected ? 'primary.main' : 'inherit',
              minWidth: 40,
              '& svg': {
                fontSize: isNested ? 20 : 24,
              },
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{
              fontSize: isNested ? 15 : 16,
              fontWeight: selected ? 600 : 500,
              letterSpacing: 0.15,
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <div>
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            letterSpacing: 0.5,
          }}
        >
          Project Zoe
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ py: 1 }}>
        {filteredNavItems.map(item => renderNavItem(item))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};


