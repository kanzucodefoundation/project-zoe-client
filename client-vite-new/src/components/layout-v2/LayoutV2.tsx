import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './AppNavbar';
import Header from './Header';
import SideMenu from './SideMenu';

import {
  chartsCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../../theme-wh/customizations';
import AppTheme from "../../theme-wh/AppTheme.tsx";

const xThemeComponents = {
  ...chartsCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function LayoutV2(props: { disableCustomTheme?: boolean, children: React.ReactNode }) {
  const { children } = props;
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'relative',
          })}
        >
          <AppNavbar />
          <Header />
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 0, md: 0 },
              pt:2
            }}
          >
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
              {children}
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
