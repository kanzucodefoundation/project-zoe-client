import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { toast } from 'react-toastify';
import { get, put } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';

const TEMPLATE_VARIABLES = [
  { label: '{name}', description: "Giver's first name" },
  { label: '{amount}', description: 'Total amount given this month' },
  { label: '{month}', description: 'Month name (e.g., March)' },
  { label: '{year}', description: 'Year (e.g., 2026)' },
];

const BIRTHDAY_TEMPLATE_VARIABLES = [
  { label: '{name}', description: "Member's first name" },
];

const DEFAULT_TEMPLATE =
  'Dear {name}, thank you for your generous contribution of {amount} in {month} {year}. Your giving makes a difference. God bless you!';

const DEFAULT_BIRTHDAY_TEMPLATE =
  'Happy Birthday {name}! Wishing you a wonderful day filled with joy and blessings. God bless you!';

const ManageNotifications = () => {
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [birthdayTemplate, setBirthdayTemplate] = useState('');
  const [savingBirthday, setSavingBirthday] = useState(false);
  const [birthdayError, setBirthdayError] = useState<string | null>(null);

  useEffect(() => {
    get(
      remoteRoutes.notificationSettings,
      (data: any) => {
        setTemplate(data?.monthlyGiversSmsTemplate || DEFAULT_TEMPLATE);
        setBirthdayTemplate(data?.birthdaySmsTemplate || DEFAULT_BIRTHDAY_TEMPLATE);
        setLoading(false);
      },
      () => {
        setTemplate(DEFAULT_TEMPLATE);
        setBirthdayTemplate(DEFAULT_BIRTHDAY_TEMPLATE);
        setLoading(false);
      }
    );
  }, []);

  const insertVariable = (variable: string) => {
    setTemplate((prev) => prev + variable);
  };

  const insertBirthdayVariable = (variable: string) => {
    setBirthdayTemplate((prev) => prev + variable);
  };

  const handleSave = () => {
    if (!template.trim()) {
      setError('SMS template cannot be empty');
      return;
    }
    setSaving(true);
    setError(null);
    put(
      remoteRoutes.notificationSettings,
      { monthlyGiversSmsTemplate: template.trim() },
      () => {
        toast.success('Notification settings saved');
        setSaving(false);
      },
      () => {
        setError('Failed to save settings. Please try again.');
        setSaving(false);
      }
    );
  };

  const handleSaveBirthday = () => {
    if (!birthdayTemplate.trim()) {
      setBirthdayError('SMS template cannot be empty');
      return;
    }
    setSavingBirthday(true);
    setBirthdayError(null);
    put(
      remoteRoutes.notificationSettings,
      { birthdaySmsTemplate: birthdayTemplate.trim() },
      () => {
        toast.success('Birthday SMS settings saved');
        setSavingBirthday(false);
      },
      () => {
        setBirthdayError('Failed to save settings. Please try again.');
        setSavingBirthday(false);
      }
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <SmsRoundedIcon color="primary" fontSize="large" />
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Manage Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure the SMS sent monthly to that month's givers
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Monthly Givers SMS
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          This message is sent automatically at the end of each month to everyone who gave that
          month. Use the variables below to personalise each message.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="body2" fontWeight={500} mb={1}>
              Available variables
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {TEMPLATE_VARIABLES.map(({ label, description }) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  variant="outlined"
                  color="primary"
                  title={description}
                  onClick={() => insertVariable(label)}
                  sx={{ cursor: 'pointer', fontFamily: 'monospace' }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Click a variable to append it to the message, or type it directly.
            </Typography>

            <TextField
              label="SMS Template"
              multiline
              minRows={4}
              fullWidth
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              disabled={saving}
              helperText={`${template.length} characters · Standard SMS is 160 characters`}
              inputProps={{ maxLength: 480 }}
            />

            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} /> : null}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Birthday SMS
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          This message is sent automatically on a member's birthday. Use the variable below to
          personalise each message.
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {birthdayError && (
              <Alert severity="error" onClose={() => setBirthdayError(null)} sx={{ mb: 2 }}>
                {birthdayError}
              </Alert>
            )}

            <Typography variant="body2" fontWeight={500} mb={1}>
              Available variables
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {BIRTHDAY_TEMPLATE_VARIABLES.map(({ label, description }) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  variant="outlined"
                  color="primary"
                  title={description}
                  onClick={() => insertBirthdayVariable(label)}
                  sx={{ cursor: 'pointer', fontFamily: 'monospace' }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Click a variable to append it to the message, or type it directly.
            </Typography>

            <TextField
              label="SMS Template"
              multiline
              minRows={4}
              fullWidth
              value={birthdayTemplate}
              onChange={(e) => setBirthdayTemplate(e.target.value)}
              disabled={savingBirthday}
              helperText={`${birthdayTemplate.length} characters · Standard SMS is 160 characters`}
              inputProps={{ maxLength: 480 }}
            />

            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSaveBirthday}
                disabled={savingBirthday}
                startIcon={savingBirthday ? <CircularProgress size={18} /> : null}
              >
                {savingBirthday ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ManageNotifications;
