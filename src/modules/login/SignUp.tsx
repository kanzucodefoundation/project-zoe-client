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
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  churchName: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  fob: string;
  location: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  churchName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  email?: string;
  fob?: string;
  location?: string;
  password?: string;
  confirmPassword?: string;
}

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    churchName: 'Worship Harvest', // Hardcoded for initial launch - uncomment field below to re-enable
    firstName: '',
    lastName: '',
    gender: '',
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
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );

  // Fetch locations from backend when church name is entered
  useEffect(() => {
    const fetchLocations = async () => {
      if (!formData.churchName || formData.churchName.trim().length < 3) {
        setFobs([]);
        return;
      }

      try {
        setIsLoadingLocations(true);
        const response = await fetch(
          `${
            remoteRoutes.groupsCombo
          }/locations/public?churchName=${encodeURIComponent(
            formData.churchName,
          )}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load locations');
        }

        const data = await response.json();
        setFobs(data.fobs || []);

        if (!data.fobs || data.fobs.length === 0) {
          toast.info('No locations found for this church');
        }
      } catch (error: any) {
        console.error('Failed to load locations:', error);
        toast.error(
          error.message ||
            'Failed to load locations. Please check the church name.',
        );
        setFobs([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    // Debounce the fetch to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchLocations();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.churchName]);

  const availableLocations = formData.fob
    ? fobs.find((f) => f.name === formData.fob)?.locations || []
    : [];

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Reset location-dependent fields when church name changes
    if (field === 'churchName') {
      setFormData((prev) => ({ ...prev, fob: '', location: '' }));
      setSelectedLocationId(null);
      setFobs([]);
      setErrors((prev) => ({ ...prev, fob: undefined, location: undefined }));
    }
  };

  const handleFobChange = (fob: string) => {
    setFormData((prev) => ({ ...prev, fob, location: '' }));
    setSelectedLocationId(null);
    setErrors((prev) => ({ ...prev, fob: undefined, location: undefined }));
  };

  const handleLocationChange = (locationName: string) => {
    const location = availableLocations.find(
      (loc) => loc.name === locationName,
    );
    setFormData((prev) => ({ ...prev, location: locationName }));
    setSelectedLocationId(location?.id || null);
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Church name validation removed - currently hardcoded to "Worship Harvest"
    // Uncomment below when church name field is re-enabled:
    // if (!formData.churchName) {
    //   newErrors.churchName = 'Church name is required';
    // } else if (formData.churchName.trim().length < 3) {
    //   newErrors.churchName = 'Church name must be at least 3 characters';
    // }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

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

    if (fobs.length === 0) {
      toast.error(
        'No locations available for this church. Please check the church name.',
      );
      return;
    }

    setIsSubmitting(true);

    post(
      remoteRoutes.signup,
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        email: formData.email,
        password: formData.password,
        groupId: selectedLocationId,
        groupRole: 'Leader',
        churchName: formData.churchName,
      },
      () => {
        setIsSubmitting(false);
        toast.success('Account created successfully! Please log in.');
        navigate(localRoutes.login);
      },
      (error, response) => {
        setIsSubmitting(false);

        // Extract error message from backend response
        let errorMessage = 'Signup failed. Please try again.';

        // The actual backend error data is in error.response.data
        const responseData = error?.response?.data || response?.data;

        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (
          responseData?.errors &&
          Array.isArray(responseData.errors) &&
          responseData.errors.length > 0
        ) {
          errorMessage = responseData.errors[0];
        } else if (error?.message && !error.message.includes('status code')) {
          // Use axios error message only if it's not the generic "Request failed with status code"
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        toast.error(errorMessage);
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
            Church Management System
          </Typography>
        </Box>
      </Box>

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
          pt: { xs: 4, sm: 6 },
          backgroundColor: 'background.paper',
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
            {/* Church Name - HIDDEN for initial launch (hardcoded to "Worship Harvest") */}
            {/* Uncomment below to re-enable church name field for multi-tenant:
            <TextField
              fullWidth
              label="Church Name"
              placeholder="e.g., Worship Harvest"
              value={formData.churchName}
              onChange={(e) => handleChange('churchName', e.target.value)}
              error={!!errors.churchName}
              helperText={errors.churchName || 'Enter your church name to load locations'}
              autoFocus
              sx={{ mb: 2.5 }}
            />
            */}

            {/* First Name */}
            <TextField
              fullWidth
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              autoFocus
              sx={{ mb: 2.5 }}
            />

            {/* Last Name */}
            <TextField
              fullWidth
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              sx={{ mb: 2.5 }}
            />

            {/* Gender */}
            <FormControl fullWidth error={!!errors.gender} sx={{ mb: 2.5 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                label="Gender"
                onChange={(e) =>
                  handleChange('gender', e.target.value as string)
                }
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
              {errors.gender && (
                <FormHelperText>{errors.gender}</FormHelperText>
              )}
            </FormControl>

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
            <FormControl
              fullWidth
              error={!!errors.fob}
              sx={{ mb: 2.5 }}
              disabled={isLoadingLocations || fobs.length === 0}
            >
              <InputLabel>FOB</InputLabel>
              <Select
                value={formData.fob}
                label="FOB"
                onChange={(e) => handleFobChange(e.target.value as string)}
              >
                {fobs.map((fob) => (
                  <MenuItem key={fob.name} value={fob.name}>
                    {fob.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.fob && <FormHelperText>{errors.fob}</FormHelperText>}
              {isLoadingLocations && (
                <FormHelperText>Loading locations...</FormHelperText>
              )}
              {!isLoadingLocations &&
                fobs.length === 0 &&
                formData.churchName && (
                  <FormHelperText>
                    No locations found. Check church name.
                  </FormHelperText>
                )}
              {!isLoadingLocations &&
                fobs.length === 0 &&
                !formData.churchName && (
                  <FormHelperText>Enter church name first</FormHelperText>
                )}
            </FormControl>

            {/* Location */}
            <FormControl
              fullWidth
              error={!!errors.location}
              sx={{ mb: 2.5 }}
              disabled={
                !formData.fob ||
                isLoadingLocations ||
                availableLocations.length === 0
              }
            >
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
              {errors.location && (
                <FormHelperText>{errors.location}</FormHelperText>
              )}
              {!formData.fob && !errors.location && (
                <FormHelperText>Select FOB first</FormHelperText>
              )}
              {formData.fob && availableLocations.length === 0 && (
                <FormHelperText>
                  No locations available for this FOB
                </FormHelperText>
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
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
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
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      size="small"
                    >
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
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create account'
              )}
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
