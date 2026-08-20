import { Box, Fab, Tooltip } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { keyframes } from '@mui/material/styles';

const HELP_URL = 'https://linktr.ee/AtProjectZoe';

const helpLabelBounce = keyframes`
  0%, 12%, 18%, 24%, 100% {
    transform: translateY(0);
  }
  15% {
    transform: translateY(-7px);
  }
  21% {
    transform: translateY(-3px);
  }
`;

// Below this width the extended "Need Help?" pill can overlap the
// "Already have an account? / Don't have an account?" links on the
// login/register forms, so it collapses to an icon-only circular FAB.
export const NARROW_SCREEN_QUERY = '@media (max-width: 500px)';

const HelpFab = () => (
  <Box
    sx={{
      position: 'fixed',
      right: { xs: 16, sm: 24 },
      bottom: { xs: 16, sm: 24 },
      zIndex: 1200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
    }}
  >
    <Box
      aria-hidden="true"
      sx={{
        position: 'relative',
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        boxShadow: 4,
        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        animation: `${helpLabelBounce} 4s ease-in-out infinite`,
        willChange: 'transform',
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          bottom: -5,
          width: 10,
          height: 10,
          backgroundColor: 'inherit',
          transform: 'translateX(-50%) rotate(45deg)',
        },
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: '#ffffff',
          color: '#000000',
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      Do You Need Help?
    </Box>

    <Tooltip title="Open support options" placement="left">
      <Fab
        variant="extended"
        color="primary"
        href={HELP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Project Zoe support options in a new tab"
        sx={{
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
        <HelpOutlineRoundedIcon
          sx={{ mr: 1, [NARROW_SCREEN_QUERY]: { mr: 0 } }}
        />
        <Box
          component="span"
          sx={{ [NARROW_SCREEN_QUERY]: { display: 'none' } }}
        >
          Contact support
        </Box>
      </Fab>
    </Tooltip>
  </Box>
);

export default HelpFab;
