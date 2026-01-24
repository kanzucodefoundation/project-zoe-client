import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';

interface SubmissionLabel {
  name: string;
  label: string;
}

interface SubmissionDetails {
  id: number;
  data: Record<string, any>;
  labels: SubmissionLabel[];
  submittedAt: string;
  submittedBy: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  details: SubmissionDetails | null;
  loading: boolean;
  reportName: string;
}

const SubmissionDetailsModal = ({ open, onClose, details, loading, reportName }: Props) => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{reportName} Submission Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : details ? (
          <Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="textSecondary">
                Submitted by: <strong>{details.submittedBy || '-'}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {details.submittedAt
                  ? new Date(details.submittedAt).toLocaleDateString()
                  : '-'}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={1.5}>
              {details.labels.map((label) => (
                <Box key={label.name} display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    {label.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatValue(details.data[label.name])}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Typography color="textSecondary">No details available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmissionDetailsModal;
