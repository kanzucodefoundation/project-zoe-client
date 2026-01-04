import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Assignment as ReportIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Send as SubmitIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { get, post } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

interface Report {
  id: string;
  name: string;
  description?: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  fields: ReportField[];
  canSubmit: boolean;
  lastSubmission?: string;
}

interface ReportSubmission {
  id: string;
  reportId: string;
  submittedBy: string;
  submittedAt: string;
  data: { [key: string]: any };
  status: 'draft' | 'submitted' | 'reviewed';
}

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [submissions, setSubmissions] = useState<ReportSubmission[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    get(
      remoteRoutes.reports,
      (response) => {
        console.log('Reports response:', response);
        setReports(response || []);
        setLoading(false);
      },
      (error) => {
        console.error('Reports error:', error);
        setLoading(false);
      }
    );
  };

  const fetchSubmissions = (reportId: string) => {
    get(
      `${remoteRoutes.reports}/${reportId}/submissions`,
      (response) => {
        setSubmissions(response || []);
      },
      (error) => {
        console.error('Submissions error:', error);
        setSubmissions([]);
      }
    );
  };

  const handleSubmitReport = (report: Report) => {
    setSelectedReport(report);
    setFormData({});
    setSubmitDialog(true);
  };

  const handleViewSubmissions = (report: Report) => {
    setSelectedReport(report);
    fetchSubmissions(report.id);
    setViewDialog(true);
  };

  const handleFormChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmitForm = () => {
    if (!selectedReport) return;

    setSubmitting(true);
    post(
      `${remoteRoutes.reports}/${selectedReport.id}/submit`,
      formData,
      (response) => {
        console.log('Submit success:', response);
        setSubmitDialog(false);
        setFormData({});
        fetchReports(); // Refresh reports list
        setSubmitting(false);
      },
      (error) => {
        console.error('Submit error:', error);
        setSubmitting(false);
      }
    );
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'primary';
      case 'monthly': return 'secondary';
      case 'quarterly': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Loading Reports...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Reports ({reports.length})
        </Typography>
      </Box>

      {reports.length === 0 ? (
        <Box textAlign="center" py={8}>
          <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No reports available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reports will appear here when they're configured by your administrator
          </Typography>
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={3}>
          {reports.map((report) => (
            <Card key={report.id} elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {report.name}
                    </Typography>
                    <Chip 
                      label={report.frequency} 
                      size="small" 
                      color={getFrequencyColor(report.frequency) as any}
                      sx={{ mb: 1 }}
                    />
                  </Box>
                </Box>

                {report.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {report.description}
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  {report.fields.length} field{report.fields.length !== 1 ? 's' : ''} to complete
                </Typography>

                {report.lastSubmission && (
                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    Last submitted: {formatDate(report.lastSubmission)}
                  </Typography>
                )}

                <Box display="flex" gap={1} mt={2}>
                  {report.canSubmit && (
                    <Button
                      variant="contained"
                      startIcon={<SubmitIcon />}
                      onClick={() => handleSubmitReport(report)}
                      size="small"
                    >
                      Submit
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewSubmissions(report)}
                    size="small"
                  >
                    View
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Submit Report Dialog */}
      <Dialog 
        open={submitDialog} 
        onClose={() => setSubmitDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Submit Report: {selectedReport?.name}</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            {selectedReport?.fields.map((field) => (
              <Box key={field.id} mb={2}>
                {field.type === 'select' ? (
                  <FormControl fullWidth>
                    <InputLabel>{field.name}{field.required && ' *'}</InputLabel>
                    <Select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFormChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      {field.options?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label={field.name}
                    type={field.type}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleFormChange(field.name, e.target.value)}
                    multiline={field.type === 'text' && field.name.toLowerCase().includes('note')}
                    rows={field.type === 'text' && field.name.toLowerCase().includes('note') ? 3 : 1}
                  />
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitForm}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Submissions Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Submissions: {selectedReport?.name}</DialogTitle>
        <DialogContent>
          {submissions.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3 }}>
              No submissions found for this report.
            </Typography>
          ) : (
            <List>
              {submissions.map((submission) => (
                <ListItem key={submission.id} divider>
                  <ListItemText
                    primary={`Submitted by ${submission.submittedBy}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(submission.submittedAt)}
                        </Typography>
                        <Chip 
                          label={submission.status} 
                          size="small" 
                          color={submission.status === 'submitted' ? 'success' : 'default'}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <ViewIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reports;