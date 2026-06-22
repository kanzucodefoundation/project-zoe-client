import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function SelectContent() {
  return (
    <Box
      sx={{
        width: '100%',
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.primary.main} 100%)`,
        backgroundSize: '200% 200%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: 'primary.contrastText',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Project Zoe
      </Typography>
    </Box>
  );
}
