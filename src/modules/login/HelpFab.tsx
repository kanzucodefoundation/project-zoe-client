import { Fab, Tooltip } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

const HELP_URL = 'https://linktr.ee/AtProjectZoe';

const HelpFab = () => (
  <Tooltip title="Need help? Click this button and get in touch with us" placement="left">
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
      }}
    >
      <HelpOutlineRoundedIcon sx={{ mr: 1 }} />
      Need Help?
    </Fab>
  </Tooltip>
);

export default HelpFab;
