import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { logout } from '../../data/coreSlice';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import SidebarHelpButton from './SidebarHelpButton';
import NotificationBell from '../../modules/notifications/NotificationBell';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({
  open,
  toggleDrawer,
}: SideMenuMobileProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.core);

  const handleLogout = () => {
    dispatch(logout());
    toggleDrawer(false)();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
          width: { xs: 'min(92vw, 380px)', sm: 380 },
          maxWidth: '100vw',
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      <Stack
        sx={{
          width: '100%',
          height: '100dvh',
          minHeight: 0,
        }}
      >
        <Stack
          direction="row"
          sx={{
            p: 2,
            pb: 1.5,
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Stack
            direction="row"
            sx={{ gap: 1.25, alignItems: 'center', flexGrow: 1, minWidth: 0 }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() ||
                user?.fullName?.charAt(0)?.toUpperCase() ||
                'U'}
            </Avatar>
            <Stack sx={{ minWidth: 0 }}>
              <Typography
                component="p"
                variant="subtitle1"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}
              >
                {user?.fullName || user?.username || 'User'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email || 'Project Zoe'}
              </Typography>
            </Stack>
          </Stack>
          <MenuButton showBadge>
            <NotificationBell/>
          </MenuButton>
          <MenuButton aria-label="Close menu" onClick={toggleDrawer(false)}>
            <CloseRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1, overflow: 'auto' }}>
          <MenuContent onNavigate={toggleDrawer(false)} />
          <Divider />
        </Stack>
        <Stack
          sx={{
            p: 2,
            pb: 'calc(16px + env(safe-area-inset-bottom))',
            gap: 1.5,
          }}
        >
          <SidebarHelpButton />
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
