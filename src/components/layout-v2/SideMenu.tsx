import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { layout } from '../../theme-wh/tokens';
import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import SidebarHelpButton from './SidebarHelpButton';

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})<{ collapsed?: boolean }>(({ theme, collapsed }) => {
  const width = collapsed
    ? layout.sidebarCollapsedWidth
    : layout.sidebarWidth;

  return {
    width,
    flexShrink: 0,
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.short,
    }),
    [`& .${drawerClasses.paper}`]: {
      width,
      boxSizing: 'border-box',
      overflowX: 'hidden',
      backgroundColor: (theme.vars || theme).palette.background.paper,
      borderRight: `1px solid ${(theme.vars || theme).palette.divider}`,
      transition: theme.transitions.create('width', {
        duration: theme.transitions.duration.short,
      }),
    },
  };
});

interface SideMenuProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function SideMenu({
  collapsed = false,
  onToggleCollapsed,
}: SideMenuProps) {
  const { user } = useSelector((state: RootState) => state.core);

  const initial =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.fullName?.charAt(0)?.toUpperCase() ||
    'U';

  return (
    <Drawer
      variant="permanent"
      collapsed={collapsed}
      sx={{ display: { xs: 'none', md: 'block' } }}
    >
      <SelectContent
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
      />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent collapsed={collapsed} />
      </Box>

      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          p: collapsed ? 1 : 1.5,
        }}
      >
        {!collapsed && (
          <Box sx={{ mb: 1.5 }}>
            <SidebarHelpButton />
          </Box>
        )}

        <Stack
          direction="row"
          sx={{
            gap: 1.25,
            p: collapsed ? 0 : 1,
            borderRadius: 1.5,
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 34,
              height: 34,
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {initial}
          </Avatar>

          {!collapsed && (
            <>
              <Box sx={{ mr: 'auto', minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                  {user?.fullName || user?.username || 'User'}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  component="div"
                >
                  {user?.email || user?.username || ''}
                </Typography>
              </Box>
              <OptionsMenu />
            </>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
