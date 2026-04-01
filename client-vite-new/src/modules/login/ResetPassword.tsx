import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { LockReset, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { extractErrorMessageFromData, put } from '../../utils/ajax';
import loginBackground from '../../assets/images/login-background.jpg';

interface FormState {
  churchName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [formData, setFormData] = useState<FormState>({
    churchName: 'Worship Harvest',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetUrl = useMemo(() => {
    if (!token) {
      return '';
    }

    return `${remoteRoutes.resetPassword}/${encodeURIComponent(token)}`;
  }, [token]);

  const handleChange = (
    field: keyof Pick<FormState, 'password' | 'confirmPassword'>,
    value: string,
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setSubmitError('');

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }

    if (field === 'password' && errors.confirmPassword) {
      setErrors((current) => ({ ...current, confirmPassword: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setSubmitError('This password reset link is invalid or incomplete.');
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    put(
      resetUrl,
      {
        churchName: formData.churchName,
        password: formData.password,
      },
      () => {
        localStorage.removeItem('password_token');
        toast.success('Password updated successfully.');
        navigate(localRoutes.updatePassword);
      },
      (error) => {
        const errorMessage =
          extractErrorMessageFromData(error?.response?.data) ||
          'Password change was unsuccessful. Please try again.';
        setSubmitError(errorMessage);
        setIsSubmitting(false);
      },
    );
  };

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
            Reset your password
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
          backgroundColor: '#fff',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <LockReset sx={{ color: '#1a2332' }} />
            <Typography variant="h4" fontWeight="bold">
              Update Password
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Choose a new password for your account. It should be at least 8
            characters long.
          </Typography>

          {!token && (
            <Alert severity="error" sx={{ mb: 3 }}>
              This password reset link is invalid. Request a new reset email to
              continue.
            </Alert>
          )}

          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={(event) => handleChange('password', event.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ mb: 2.5 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(event) =>
                handleChange('confirmPassword', event.target.value)
              }
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting || !token}
              sx={{
                py: 1.5,
                backgroundColor: '#1a2332',
                '&:hover': { backgroundColor: '#2d4059' },
                textTransform: 'none',
                fontSize: '1rem',
                mb: 2,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Update Password'
              )}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Need another link?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate(localRoutes.forgotPassword)}
                sx={{ cursor: 'pointer' }}
              >
                Request password reset
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;
