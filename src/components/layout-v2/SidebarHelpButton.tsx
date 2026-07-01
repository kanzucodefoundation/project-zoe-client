import Button from '@mui/material/Button';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

const HELP_URL = 'https://linktr.ee/AtProjectZoe';

export default function SidebarHelpButton() {
  return (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      disableElevation
      startIcon={<HelpOutlineRoundedIcon />}
      href={HELP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Need help? Get in touch with us"
      sx={{
        textTransform: 'none',
        fontWeight: 600,
      }}
    >
      Need Help?
    </Button>
  );
}
