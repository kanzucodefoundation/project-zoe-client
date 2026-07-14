import { Box, Fab, Tooltip } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

const HELP_URL = 'https://linktr.ee/AtProjectZoe';

// Below this width the extended "Need Help?" pill can overlap the
// "Already have an account? / Don't have an account?" links on the
// login/register forms, so it collapses to an icon-only circular FAB.
export const NARROW_SCREEN_QUERY = '@media (max-width: 500px)';

const HelpFab = () => (
  <Tooltip title="Need help? Click Me!" placement="left">
    <Fab
      variant="extended"
      color="primary"
      href={HELP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Need help? Click this button and get in touch with us"
      sx={{
        position: 'fixed',
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: 1200,
        boxShadow: 6,
        textTransform: 'none',
        fontWeight: 600,
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: '#ffffff',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
        [NARROW_SCREEN_QUERY]: {
          minWidth: 0,
          width: 48,
          height: 48,
          borderRadius: '50%',
          px: 0,
        },
      }}
    >
      <HelpOutlineRoundedIcon sx={{ mr: 1, [NARROW_SCREEN_QUERY]: { mr: 0 } }} />
      <Box component="span" sx={{ [NARROW_SCREEN_QUERY]: { display: 'none' } }}>
        Need Help?
      </Box>
    </Fab>
  </Tooltip>
);

export default HelpFab;
