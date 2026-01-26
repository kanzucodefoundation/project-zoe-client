import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import CustomDatePicker from './CustomDatePicker';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from './ColorModeIconDropdown';

import Search from './Search';

export default function Header() {
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
          <Stack direction="row" sx={{ gap: 1 }}>
            <Search />
            <CustomDatePicker />
            <MenuButton showBadge aria-label="Open notifications">
              <NotificationsRoundedIcon />
            </MenuButton>
            <ColorModeIconDropdown />
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
