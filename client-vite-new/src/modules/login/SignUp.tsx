import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { post } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import loginBackground from '../../assets/images/login-background.jpg';

interface Location {
  id: number;
  name: string;
}

interface Fob {
  name: string;
  locations: Location[];
}

interface FormData {
  email: string;
  fob: string;
  location: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  fob?: string;
  location?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    fob: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fobs, setFobs] = useState<Fob[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  // Fetch locations from backend on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const response = await fetch(`${remoteRoutes.groupsCombo}/locations/public`);
        const data = await response.json();
        setFobs(data.fobs || []);
      } catch (error) {
        console.error('Failed to load locations:', error);
        toast.error('Failed to load locations. Please refresh the page.');
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const availableLocations = formData.fob
    ? fobs.find(f => f.name === formData.fob)?.locations || []
    : [];

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFobChange = (fob: string) => {
    setFormData((prev) => ({ ...prev, fob, location: '' }));
    setSelectedLocationId(null);
    setErrors((prev) => ({ ...prev, fob: undefined, location: undefined }));
  };

  const handleLocationChange = (locationName: string) => {
    const location = availableLocations.find(loc => loc.name === locationName);
    setFormData((prev) => ({ ...prev, location: locationName }));
    setSelectedLocationId(location?.id || null);
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.fob) {
      newErrors.fob = 'FOB is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!selectedLocationId) {
      toast.error('Please select a valid location');
      return;
    }

    setIsSubmitting(true);

    post(
      remoteRoutes.signup,
      {
        email: formData.email,
        password: formData.password,
        groupId: selectedLocationId,
        groupRole: 'Leader',
        churchName: 'Worship Harvest',
      },
      () => {
        setIsSubmitting(false);
        toast.success('Account created successfully! Please log in.');
        navigate(localRoutes.login);
      },
      () => {
        setIsSubmitting(false);
      },
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left image panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          backgroundImage: `url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          alignItems: 'center',
          justifyContent: 'center',
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
        <Box sx={{ textAlign: 'center', color: 'white', zIndex: 1, px: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Project Zoe
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Church Management System
          </Typography>
        </Box>
      </Box>

      {/* Right form panel */}
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
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter your details to get started
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              placeholder="name@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2.5 }}
            />

            {/* FOB */}
            <FormControl fullWidth error={!!errors.fob} sx={{ mb: 2.5 }}>
              <InputLabel>FOB</InputLabel>
              <Select
                value={formData.fob}
                label="FOB"
                onChange={(e) => handleFobChange(e.target.value as string)}
                disabled={isLoadingLocations}
              >
                {fobs.map((fob) => (
                  <MenuItem key={fob.name} value={fob.name}>
                    {fob.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.fob && <FormHelperText>{errors.fob}</FormHelperText>}
              {isLoadingLocations && <FormHelperText>Loading locations...</FormHelperText>}
            </FormControl>

            {/* Location */}
            <FormControl fullWidth error={!!errors.location} sx={{ mb: 2.5 }} disabled={!formData.fob || isLoadingLocations}>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.location}
                label="Location"
                onChange={(e) => handleLocationChange(e.target.value as string)}
              >
                {availableLocations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.name}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.location && <FormHelperText>{errors.location}</FormHelperText>}
              {!formData.fob && !errors.location && (
                <FormHelperText>Select FOB first</FormHelperText>
              )}
            </FormControl>

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              placeholder="Create a password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ mb: 2.5 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password */}
            <TextField
              fullWidth
              label="Confirm Password"
              placeholder="Confirm your password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                backgroundColor: '#1a2332',
                '&:hover': { backgroundColor: '#2d4059' },
                textTransform: 'none',
                fontSize: '1rem',
                mb: 2,
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create account'}
            </Button>

            {/* Sign in link */}
            <Typography variant="body2" align="center" color="text.secondary">
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate(localRoutes.login)}
                sx={{ cursor: 'pointer' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;
