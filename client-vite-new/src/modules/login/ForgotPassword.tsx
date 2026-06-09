import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { post } from '../../utils/ajax';
import { localRoutes, remoteRoutes } from '../../data/constants';
import loginBackground from '../../assets/images/login-background.jpg';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    post(
      remoteRoutes.forgotPassword,
      {
        churchName: 'Worship Harvest',
        username: email,
      },
      () => {
        setSuccess(
          'An email has been sent to the provided address if it exists in the platform.',
        );
        setEmail('');
        setLoading(false);
      },
      () => {
        setError(
          'Sorry, we encountered an issue while processing your password reset request. Please try again.',
        );
        setLoading(false);
      },
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: '100vh',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Mobile image masthead */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          minHeight: { xs: 184, sm: 220 },
          alignItems: 'flex-end',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'common.white',
          px: 3,
          pb: { xs: 3, sm: 4 },
          backgroundImage: `linear-gradient(180deg, rgba(14, 23, 36, 0.28), rgba(14, 23, 36, 0.72)), url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box>
          <Typography
            component="h1"
            variant="h4"
            fontWeight="bold"
            sx={{ lineHeight: 1.1 }}
          >
            Project Zoe
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Password Recovery
          </Typography>
        </Box>
      </Box>

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
            Password Recovery
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
          pt: { xs: 4, sm: 6 },
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Forgot Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter your email address and we&apos;ll send reset instructions if
            an account exists.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: '#1a2332',
                '&:hover': { backgroundColor: '#2d4059' },
                textTransform: 'none',
                fontSize: '1rem',
                mb: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Send Reset Email'
              )}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Remembered your password?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate(localRoutes.login)}
                sx={{ cursor: 'pointer' }}
              >
                Back to login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
