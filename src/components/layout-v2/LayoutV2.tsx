import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { useCallback, useSyncExternalStore } from 'react';

import Box from '@mui/material/Box';
import AppNavbar from './AppNavbar';
import Header from './Header';
import SideMenu from './SideMenu';
import { layout } from '../../theme-wh/tokens';

const COLLAPSE_STORAGE_KEY = 'zoe.sidebarCollapsed';

const collapseStore = {
  listeners: new Set<() => void>(),

  subscribe(listener: () => void) {
    collapseStore.listeners.add(listener);

    const onStorage = (event: StorageEvent) => {
      if (event.key === COLLAPSE_STORAGE_KEY) listener();
    };

    window.addEventListener('storage', onStorage);

    return () => {
      collapseStore.listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },

  read(): boolean {
    try {
      return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  },

  write(next: boolean) {
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
    } catch {
      // The preference does not persist; navigation still works.
    }
    collapseStore.listeners.forEach((listener) => listener());
  },
};

export default function LayoutV2(props: {
  disableCustomTheme?: boolean;
  children: React.ReactNode;
}) {
  const { children } = props;

  const collapsed = useSyncExternalStore(
    collapseStore.subscribe,
    collapseStore.read,
    () => false,
  );

  const toggleCollapsed = useCallback(() => {
    collapseStore.write(!collapseStore.read());
  }, []);

  return (
    <Box sx={{ display: 'flex', minWidth: 0, bgcolor: 'background.default' }}>
      <SideMenu collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: 'background.default',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          position: 'relative',
        }}
      >
        <AppNavbar />
        <Header
          sidebarCollapsed={collapsed}
          onExpandSidebar={toggleCollapsed}
        />

        <Box
          sx={{
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            mx: 'auto',
            minWidth: 0,
            px: { xs: 2.5, sm: 3, lg: 4 },
            pt: { xs: 2.5, sm: 3 },
            pb: {
              xs: 'calc(24px + env(safe-area-inset-bottom))',
              md: 4,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
