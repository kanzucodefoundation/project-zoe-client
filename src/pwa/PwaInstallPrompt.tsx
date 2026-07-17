import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddToHomeScreenRoundedIcon from '@mui/icons-material/AddToHomeScreenRounded';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';

type BeforeInstallPromptChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<BeforeInstallPromptChoice>;
  prompt: () => Promise<void>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const INSTALL_PROMPT_SNOOZE_KEY = 'project-zoe-pwa-install-snooze-until';
const INSTALL_PROMPT_SNOOZE_MS = 24 * 60 * 60 * 1000;
const MAX_TIMEOUT_MS = 2_147_483_647;

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  Boolean((window.navigator as NavigatorWithStandalone).standalone);

const readSnoozeUntil = () => {
  const storedValue = window.localStorage.getItem(INSTALL_PROMPT_SNOOZE_KEY);
  const snoozeUntil = Number(storedValue);
  return Number.isFinite(snoozeUntil) ? snoozeUntil : 0;
};

const isIosDevice = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === 'MacIntel' &&
      window.navigator.maxTouchPoints > 1)
  );
};

export default function PwaInstallPrompt() {
  const theme = useTheme();
  const isSmallViewport = useMediaQuery(theme.breakpoints.down('md'));

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [reminderCycle, setReminderCycle] = useState(0);

  const isIos = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return isIosDevice();
  }, []);

  const shouldAskOnThisDevice =
    isSmallViewport && isTouchDevice && !isInstalled;

  useEffect(() => {
    setIsInstalled(isStandalone());
    setIsTouchDevice(
      window.navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches,
    );

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setReminderCycle((cycle) => cycle + 1);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setGuideOpen(false);
      setIsVisible(false);
      setIsInstalled(true);
      window.localStorage.removeItem(INSTALL_PROMPT_SNOOZE_KEY);
    };

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      setIsInstalled(isStandalone());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    standaloneQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    if (!shouldAskOnThisDevice) {
      setIsVisible(false);
      return undefined;
    }

    const snoozeUntil = readSnoozeUntil();
    const waitMs = snoozeUntil - Date.now();

    if (waitMs > 0) {
      setIsVisible(false);
      const timeout = window.setTimeout(
        () => setReminderCycle((cycle) => cycle + 1),
        Math.min(waitMs, MAX_TIMEOUT_MS),
      );
      return () => window.clearTimeout(timeout);
    }

    setIsVisible(true);
    return undefined;
  }, [shouldAskOnThisDevice, reminderCycle, deferredPrompt]);

  const snoozePrompt = () => {
    const snoozeUntil = Date.now() + INSTALL_PROMPT_SNOOZE_MS;
    window.localStorage.setItem(
      INSTALL_PROMPT_SNOOZE_KEY,
      String(snoozeUntil),
    );
    setIsVisible(false);
    setGuideOpen(false);
    setReminderCycle((cycle) => cycle + 1);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setIsVisible(false);
      setGuideOpen(true);
      return;
    }

    setIsVisible(false);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);

      if (choice.outcome === 'dismissed') {
        snoozePrompt();
      } else {
        window.localStorage.removeItem(INSTALL_PROMPT_SNOOZE_KEY);
      }
    } catch (error) {
      console.warn('Project Zoe install prompt failed:', error);
      setGuideOpen(true);
    }
  };

  if (!shouldAskOnThisDevice) {
    return null;
  }

  return (
    <>
      {isVisible && (
        <Paper
          elevation={8}
          role="dialog"
          aria-label="Install Project Zoe"
          sx={{
            position: 'fixed',
            right: { xs: 12, sm: 16 },
            bottom: 'calc(12px + env(safe-area-inset-bottom))',
            left: { xs: 12, sm: 'auto' },
            width: { xs: 'auto', sm: 420 },
            zIndex: (muiTheme) => muiTheme.zIndex.snackbar,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1.5,
            backgroundImage: 'none',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <InstallMobileRoundedIcon fontSize="small" />
            </Box>
            <Stack spacing={1} sx={{ minWidth: 0, flexGrow: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.primary">
                  Install Project Zoe
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add it to this phone for quicker access.
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}
              >
                <Button size="small" color="inherit" onClick={snoozePrompt}>
                  Later
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<InstallMobileRoundedIcon />}
                  onClick={handleInstall}
                >
                  Install
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Dialog
        open={guideOpen}
        onClose={snoozePrompt}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Install Project Zoe</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              {isIos ? (
                <IosShareRoundedIcon color="primary" />
              ) : (
                <AddToHomeScreenRoundedIcon color="primary" />
              )}
              <Typography variant="body2" color="text.secondary">
                {isIos
                  ? 'Tap Share, then Add to Home Screen.'
                  : 'Open the browser menu, then choose Install app or Add to Home screen.'}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={snoozePrompt}>
            Later
          </Button>
          <Button variant="contained" onClick={snoozePrompt}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
