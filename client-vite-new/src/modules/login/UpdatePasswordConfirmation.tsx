import { Box, Button, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { localRoutes } from '../../data/constants';
import loginBackground from '../../assets/images/login-background.jpg';

const UpdatePasswordConfirmation = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          backgroundImage: `url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        />
        <Box
          sx={{
            textAlign: 'center',
            color: 'white',
            zIndex: 1,
            px: 4,
            margin: 'auto',
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Project Zoe
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Password update complete
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <CheckCircleOutline sx={{ fontSize: 64, color: '#2e7d32', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Password Updated
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your password has been updated successfully. Return to the login
            page and sign in with your new password.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate(localRoutes.login)}
            sx={{
              py: 1.5,
              backgroundColor: '#1a2332',
              '&:hover': { backgroundColor: '#2d4059' },
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Go to login
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdatePasswordConfirmation;
