import { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
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
import IntegrationInstructionsRoundedIcon from '@mui/icons-material/IntegrationInstructionsRounded';
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
    icon: <Diversity3RoundedIcon />,
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
    name: 'Notifications',
    icon: <SmsRoundedIcon />,
    path: localRoutes.notificationMessages,
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
        icon: <ManageAccountsRoundedIcon />,
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
      // { name: 'Group Categories', icon: <Diversity3RoundedIcon />, path: localRoutes.groupsCategories },
      // { name: 'Settings', icon: <SettingsRoundedIcon />, path: localRoutes.settings },
    ],
  },
  {
    name: 'Integrations',
    icon: <IntegrationInstructionsRoundedIcon />,
    path: localRoutes.integrations,
    requiredRoles: [
      appPermissions.roleIntegrationsView,
      appPermissions.roleIntegrationsEdit,
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
];

interface MenuContentProps {
  onNavigate?: () => void;
  /** Icon rail. Labels are carried by tooltips instead. */
  collapsed?: boolean;
}

export default function MenuContent({
  onNavigate,
  collapsed = false,
}: MenuContentProps) {
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

  /**
   * One row. The selected state comes from the theme rather than from here,
   * so it stays the brand tint everywhere instead of each screen restating it.
   */
  const rowSx = (nested: boolean) => ({
    borderRadius: 1.5,
    minHeight: { xs: 44, md: 38 },
    mb: 0.25,
    px: collapsed ? 0 : 0.75,
    pl: collapsed || !nested ? undefined : 2.25,
    justifyContent: collapsed ? 'center' : 'flex-start',
    color: 'text.secondary',
    '&:hover': { color: 'text.primary' },
  });

  const iconSx = {
    minWidth: collapsed ? 0 : 34,
    color: 'inherit',
    justifyContent: 'center',
    '& svg': { fontSize: 20 },
  };

  const labelProps = (selected: boolean) => ({
    fontSize: 14,
    fontWeight: selected ? 600 : 500,
    noWrap: true,
  });

  /** Collapsed rows are glyphs, so the name has to be reachable some way. */
  const withTooltip = (node: React.ReactElement, label: string) =>
    collapsed ? (
      <Tooltip title={label} placement="right">
        <Box sx={{ display: 'block' }}>{node}</Box>
      </Tooltip>
    ) : (
      node
    );

  const renderNavItem = (item: NavItem, level = 0) => {
    const selected = isSelected(item);

    if (item.children) {
      const isOpen =
        !collapsed &&
        (expandedMenu === item.name || activeParentName === item.name);

      return (
        <Box component="li" key={item.name} sx={{ listStyle: 'none' }}>
          {withTooltip(
            <ListItemButton
              // Collapsed there is nowhere to expand into, so the parent goes
              // straight to its first child rather than doing nothing.
              onClick={() =>
                collapsed
                  ? handleNavigate(item.children![0].path)
                  : handleMenuToggle(item.name)
              }
              selected={selected}
              aria-label={collapsed ? item.name : undefined}
              sx={rowSx(level > 0)}
            >
              <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={labelProps(selected)}
                  />
                  {isOpen ? (
                    <ExpandLessRoundedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
                  )}
                </>
              )}
            </ListItemButton>,
            item.name,
          )}

          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <Box component="li" key={item.name} sx={{ listStyle: 'none' }}>
        {withTooltip(
          <ListItemButton
            selected={selected}
            onClick={() => handleNavigate(item.path)}
            aria-label={collapsed ? item.name : undefined}
            sx={rowSx(level > 0)}
          >
            <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={item.name}
                primaryTypographyProps={labelProps(selected)}
              />
            )}
          </ListItemButton>,
          item.name,
        )}
      </Box>
    );
  };

  return (
    <Stack sx={{ flexGrow: 1, py: 1 }}>
      <List disablePadding sx={{ px: collapsed ? 0.75 : 1 }}>
        {filteredNavItems.map((item) => renderNavItem(item))}
      </List>
    </Stack>
  );
}
