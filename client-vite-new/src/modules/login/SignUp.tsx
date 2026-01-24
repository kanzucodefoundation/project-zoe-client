import { useState } from 'react';
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

const fobOptions = [
  'Arua',
  'Bugolobi',
  'Entebbe',
  'Fort Portal',
  'Gayaza',
  'Gulu',
  'Hoima',
  'Iganga',
  'Jinja',
  'Joggo',
  'Kabubbu',
  'Kajjansi',
  'Kamuli',
  'Kansanga',
  'Kenya',
  'Kira',
  'Kitukutwe',
  'Kungu',
  'Makerere',
  'Masaka',
  'Matugga',
  'Mbale',
  'Mbarara',
  'Mpigi',
  'Mukono',
  'Mukono Central',
  'Naalya',
  'Nakawa',
  'Rest of Africa',
  'Global West',
  'Sentema',
  'Wairaka',
  'Wakiso',
];

const locationsByFob: Record<string, string[]> = {
  Arua: ['WHARUA'],
  Bugolobi: ['WHBUGO'],
  Entebbe: ['WHABYT', 'WHBWYA', 'WHEBCT', 'WHENTB', 'WHGRUG', 'WHKGNG', 'WHKSNJ', 'WHNKWK'],
  'Fort Portal': ['WHFTPL'],
  Gayaza: ['WHGAYA'],
  Gulu: ['WHGULU'],
  Hoima: ['WHHOIM'],
  Iganga: ['WHIGGA'],
  Jinja: ['WHBDND', 'WHBGMB', 'WHBWNG', 'WHJNJA', 'WHKBBI', 'WHMBKO', 'WHMTAI', 'WHNJRU', 'WHNWPD'],
  Joggo: ['WHBAJO', 'WHBKRR', 'WHBKSA', 'WHJOGO', 'WHNMVE', 'WHNSBW'],
  Kabubbu: ['WHBSKM', 'WHBUSK', 'WHKBUB', 'WHNMLG', 'WHNMPG'],
  Kajjansi: ['WHKAJJ'],
  Kamuli: ['WHKMLI'],
  Kansanga: ['WHKNSA'],
  Kenya: ['WHKENY'],
  Kira: ['WHKIRA'],
  Kitukutwe: ['WHKITK', 'WHNKWR'],
  Kungu: ['WHKNGU'],
  Makerere: ['WHMKRE'],
  Masaka: ['WHMSKA'],
  Matugga: ['WHKITI', 'WHKLMZ', 'WHKVLE', 'WHKWMP', 'WHKWND', 'WHLGBA', 'WHMGJO', 'WHMTUG', 'WHNDJB', 'WHNKSK', 'WHTULA'],
  Mbale: ['WHMBLE'],
  Mbarara: ['WHBHRW', 'WHIBND', 'WHISHK', 'WHKBLE', 'WHKKBA', 'WHMBRR', 'WHNTMO'],
  Mpigi: ['WHMPGI'],
  Mukono: ['WHKBMB', 'WHKTKS', 'WHKYNG', 'WHLUGZ', 'WHMKNO', 'WHMCTY', 'WHNTWO', 'WHNKFM'],
  'Mukono Central': ['WHMCCN'],
  Naalya: ['WHBYGR', 'WHKITO', 'WHKWGA', 'WHMSDY', 'WHNTDA', 'WHSETA', 'WHSOND', 'WHNLYA', 'WHNLYG', 'WHNKWR'],
  Nakawa: ['WHNKWA'],
  'Rest of Africa': ['WHAFOL', 'WHASOL', 'WHDRSM', 'WHKGLI', 'WHLUSK'],
  'Global West': ['WHAUST', 'WHCNDA', 'WHEUOL', 'WHGMNY', 'WHGNVA', 'WHLEDS', 'WHLUTN', 'WHNWLS', 'WHTXAS', 'WHUKDM', 'WHUSOA'],
  Sentema: ['WHSENT'],
  Wairaka: ['WHWRAK'],
  Wakiso: ['WHBSGA', 'WHBULB', 'WHKKRI', 'WHKSGJ', 'WHKYGW', 'WHMSLT', 'WHMTYN', 'WHNGND', 'WHNSNA', 'WHNYSA'],
};

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

  const availableLocations = formData.fob ? locationsByFob[formData.fob] || [] : [];

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFobChange = (fob: string) => {
    setFormData((prev) => ({ ...prev, fob, location: '' }));
    setErrors((prev) => ({ ...prev, fob: undefined, location: undefined }));
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

    setIsSubmitting(true);

    post(
      remoteRoutes.signup,
      {
        email: formData.email,
        password: formData.password,
        fob: formData.fob,
        location: formData.location,
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
      {/* Left decorative panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          background: 'linear-gradient(135deg, #1a2332 0%, #2d4059 100%)',
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
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <Box sx={{ textAlign: 'center', color: 'white', zIndex: 1, px: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Project Zoe
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
              >
                {fobOptions.map((fob) => (
                  <MenuItem key={fob} value={fob}>
                    {fob}
                  </MenuItem>
                ))}
              </Select>
              {errors.fob && <FormHelperText>{errors.fob}</FormHelperText>}
            </FormControl>

            {/* Location */}
            <FormControl fullWidth error={!!errors.location} sx={{ mb: 2.5 }} disabled={!formData.fob}>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.location}
                label="Location"
                onChange={(e) => handleChange('location', e.target.value as string)}
              >
                {availableLocations.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
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
