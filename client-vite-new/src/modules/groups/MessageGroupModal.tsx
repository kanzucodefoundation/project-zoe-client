import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { SmsRounded as SmsIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface Props {
  open: boolean;
  onClose: () => void;
  groupId: number;
  groupName: string;
}

interface SmsInfo {
  totalMembers: number;
  membersWithPhone: number;
  membersWithoutPhone: number;
}

const MAX_CHARS = 160;

const MessageGroupModal = ({ open, onClose, groupId, groupName }: Props) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [message, setMessage] = useState('');
  const [smsInfo, setSmsInfo] = useState<SmsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMessage('');
      setError(null);
      setLoading(true);

      get(
        `${remoteRoutes.groups}/${groupId}/sms-info`,
        (data: SmsInfo) => {
          setSmsInfo(data);
          setLoading(false);
        },
        () => {
          setError('Failed to load group member info');
          setLoading(false);
        },
      );
    }
  }, [open, groupId]);

  const handleSend = () => {
    if (!message.trim() || message.length > MAX_CHARS) return;

    setSending(true);
    setError(null);

    post(
      `${remoteRoutes.groups}/${groupId}/sms`,
      { message: message.trim() },
      (response: { sentTo: number }) => {
        toast.success(`SMS sent to ${response.sentTo} members`);
        setSending(false);
        onClose();
      },
      (err: any) => {
        setError(err?.message || 'Failed to send SMS');
        setSending(false);
      },
    );
  };

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = message.trim().length > 0 && !isOverLimit && !sending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isPhone}
      scroll="paper"
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SmsIcon color="primary" />
        Send SMS to {groupName}
      </DialogTitle>
      <DialogContent dividers={isPhone}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Member counts */}
            {smsInfo && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Sending to {smsInfo.membersWithPhone} of{' '}
                  {smsInfo.totalMembers} members
                </Typography>
                {smsInfo.membersWithoutPhone > 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {smsInfo.membersWithoutPhone} member
                    {smsInfo.membersWithoutPhone > 1 ? 's have' : ' has'} no
                    phone number and will be skipped
                  </Alert>
                )}
              </Box>
            )}

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Message input */}
            <TextField
              label="Message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              fullWidth
              disabled={sending}
              error={isOverLimit}
              helperText={
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    color: isOverLimit ? 'error.main' : 'text.secondary',
                  }}
                >
                  {charCount} / {MAX_CHARS} characters
                </Box>
              }
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending} fullWidth={isPhone}>
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!canSend || loading}
          fullWidth={isPhone}
          startIcon={sending ? <CircularProgress size={20} /> : <SmsIcon />}
        >
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageGroupModal;
