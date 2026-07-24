import { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { localRoutes, appPermissions } from '../../data/constants';
import {
  attendanceViewCapabilities,
  hasAnyCapability,
  taskViewCapabilities,
} from '../../utils/permissions';

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
    icon: <DashboardRoundedIcon />,
    path: localRoutes.dashboard,
  },
  {
    name: 'People',
    icon: <PeopleRoundedIcon />,
    path: localRoutes.contacts,
    requiredRoles: [appPermissions.roleCrmView, appPermissions.roleCrmEdit],
  },
  {
    name: 'Groups',
    icon: <GroupRoundedIcon />,
    path: localRoutes.groups,
    requiredRoles: [appPermissions.roleGroupView, appPermissions.roleGroupEdit],
  },
  {
    name: 'Reports',
    icon: <AssessmentRoundedIcon />,
    path: localRoutes.reports,
    requiredRoles: [appPermissions.roleReportView],
    children: [
      {
        name: 'Reports',
        icon: <AssessmentRoundedIcon />,
        path: localRoutes.reports,
      },
      {
        name: 'Retention Report',
        icon: <TrendingUpRoundedIcon />,
        path: localRoutes.retentionReport,
      },
    ],
  },
  {
    name: 'Attendance',
    icon: <HowToRegRoundedIcon />,
    path: localRoutes.attendance,
    requiredRoles: attendanceViewCapabilities,
    children: [
      {
        name: 'Check-In',
        icon: <HowToRegRoundedIcon />,
        path: localRoutes.attendance,
      },
      {
        name: 'Schedules',
        icon: <CalendarMonthRoundedIcon />,
        path: localRoutes.attendanceSchedules,
      },
      {
        name: 'History',
        icon: <HistoryRoundedIcon />,
        path: localRoutes.attendanceHistory,
      },
    ],
  },
  {
    name: 'Tasks',
    icon: <ChecklistRoundedIcon />,
    path: localRoutes.tasks,
    requiredRoles: taskViewCapabilities,
    children: [
      {
        name: 'Task Queue',
        icon: <ChecklistRoundedIcon />,
        path: localRoutes.tasks,
      },
      {
        name: 'My Tasks',
        icon: <AssignmentIndRoundedIcon />,
        path: localRoutes.tasksMine,
      },
      {
        name: 'Assign Tasks',
        icon: <AssignmentTurnedInRoundedIcon />,
        path: localRoutes.tasksAssign,
      },
    ],
  },
  {
    name: 'Admin',
    icon: <SettingsRoundedIcon />,
    path: localRoutes.settings,
    requiredRoles: [appPermissions.roleUserView, appPermissions.roleUserEdit],
    children: [
      {
        name: 'Manage Users',
        icon: <PeopleRoundedIcon />,
        path: localRoutes.users,
      },
      {
        name: 'Manage Reports',
        icon: <AssessmentRoundedIcon />,
        path: localRoutes.reportConfiguration,
      },
      {
        name: 'Manage Notifications',
        icon: <SmsRoundedIcon />,
        path: localRoutes.notifications,
      },
      // { name: 'Group Categories', icon: <GroupRoundedIcon />, path: localRoutes.groupsCategories },
      // { name: 'Settings', icon: <SettingsRoundedIcon />, path: localRoutes.settings },
    ],
  },
  {
    name: 'Finance',
    icon: <AccountBalanceRoundedIcon />,
    path: localRoutes.financialAccounts,
    requiredRoles: [
      appPermissions.roleFinanceView,
      appPermissions.roleFinanceEdit,
    ],
    children: [
      {
        name: 'Accounts',
        icon: <AccountBalanceRoundedIcon />,
        path: localRoutes.financialAccounts,
      },
      {
        name: 'Import Transactions',
        icon: <UploadFileRoundedIcon />,
        path: localRoutes.financialImport,
      },
      {
        name: 'Reconciliation',
        icon: <CompareArrowsRoundedIcon />,
        path: localRoutes.financialReconciliation,
      },
      {
        name: 'Distributions',
        icon: <AccountTreeRoundedIcon />,
        path: localRoutes.financialDistributions,
      },
      {
        name: 'Category Rules',
        icon: <RuleRoundedIcon />,
        path: localRoutes.financialCategoryRules,
      },
      {
        name: 'Reports',
        icon: <BarChartRoundedIcon />,
        path: localRoutes.financialReports,
      },
    ],
  },
  {
    name: 'Notifications',
    icon: <SmsRoundedIcon />,
    path: localRoutes.notificationMessages,
  },
];

interface MenuContentProps {
  onNavigate?: () => void;
}

export default function MenuContent({ onNavigate }: MenuContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.core);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleMenuToggle = (menuName: string) => {
    setExpandedMenu((current) => (current === menuName ? null : menuName));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  // Filter navigation items based on user capabilities
  const filteredNavItems = navItems.filter((item) =>
    hasAnyCapability(user, item.requiredRoles),
  );

  const matchesPath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getActivePath = (items: NavItem[]): string | null => {
    let activePath: string | null = null;

    const visit = (entries: NavItem[]) => {
      entries.forEach((entry) => {
        if (
          matchesPath(entry.path) &&
          (!activePath || entry.path.length > activePath.length)
        ) {
          activePath = entry.path;
        }

        if (entry.children) {
          visit(entry.children);
        }
      });
    };

    visit(items);
    return activePath;
  };

  const activePath = getActivePath(filteredNavItems);

  const hasActiveChild = (item: NavItem): boolean =>
    item.children?.some((child) => activePath === child.path) ?? false;

  const activeParentName =
    filteredNavItems.find((item) => hasActiveChild(item))?.name ?? null;

  useEffect(() => {
    setExpandedMenu(activeParentName);
  }, [activeParentName]);

  const isSelected = (item: NavItem): boolean => {
    if (item.children) {
      return (
        item.children.some((child) => isSelected(child)) ||
        activePath === item.path
      );
    }

    return activePath === item.path;
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const selected = isSelected(item);
    const isNested = level > 0;

    if (item.children) {
      const isOpen =
        expandedMenu === item.name || activeParentName === item.name;

      return (
        <div key={item.name}>
          <ListItem disablePadding sx={{ display: 'block', pl: level * 2 }}>
            <ListItemButton
              onClick={() => handleMenuToggle(item.name)}
              selected={selected}
              sx={{
                py: 1.25,
                px: 2,
                minHeight: { xs: 52, md: 48 },
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
                  color: selected ? 'primary.paper' : 'inherit',
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
                  fontSize: '0.95rem',
                  fontWeight: selected ? 600 : 400,
                }}
              />
              <Box sx={{ ml: 'auto' }}>
                {isOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </Box>
            </ListItemButton>
          </ListItem>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        </div>
      );
    }

    return (
      <ListItem
        key={item.name}
        disablePadding
        sx={{ display: 'block', pl: level * 2 }}
      >
        <ListItemButton
          selected={selected}
          onClick={() => handleNavigate(item.path)}
          sx={{
            py: 1.25,
            px: 2,
            minHeight: { xs: 52, md: 48 },
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
              fontSize: '0.95rem',
              fontWeight: selected ? 600 : 400,
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Stack sx={{ flexGrow: 1, p: { xs: 1, md: 1.5 } }}>
      <List>{filteredNavItems.map((item) => renderNavItem(item))}</List>
    </Stack>
  );
}
