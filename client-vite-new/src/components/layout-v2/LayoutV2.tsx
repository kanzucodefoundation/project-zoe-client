import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './AppNavbar';
import Header from './Header';
import SideMenu from './SideMenu';

export default function LayoutV2(props: {
  disableCustomTheme?: boolean;
  children: React.ReactNode;
}) {
  const { children } = props;
  return (
    <Box sx={{ display: 'flex', minWidth: 0 }}>
      <SideMenu />
      {/* Main content */}
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          minWidth: 0,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          position: 'relative',
        })}
      >
        <AppNavbar />
        <Header />
        <Stack
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{
            alignItems: 'center',
            px: 3,
            pb: { xs: 'calc(24px + env(safe-area-inset-bottom))', md: 5 },
            mt: 0,
            pt: { xs: 1.5, md: 2 },
            minWidth: 0,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: { sm: '100%', md: '1700px' },
              minWidth: 0,
            }}
          >
            {children}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
