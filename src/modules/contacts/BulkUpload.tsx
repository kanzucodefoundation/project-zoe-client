import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { extractBadRequestErrorMessage, postFile } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { serviceRecordingApi } from '../service-recording/api';
//import { BulkUploadSummary } from '../service-recording/types';

interface BulkRowResult {
  row: number;
  name: string;
  status: 'created' | 'linked' | 'error';
  error?: string;
}

interface BulkUploadSummary {
  total: number;
  created: number;
  linked: number;
  errors: BulkRowResult[];
}

type UploadMode = 'contacts' | 'guests' | 'believers' | 'redzone';

interface BulkUploadProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface ContactsUploadResult {
  type: 'contacts';
  success: boolean;
  totalRows: number;
  successfulRows: number;
  errors: string[];
}

interface ServiceUploadResult {
  type: 'service';
  summary: BulkUploadSummary;
  error?: string;
}

type UploadResult = ContactsUploadResult | ServiceUploadResult;

const TEMPLATES: Record<UploadMode, string> = {
  contacts:
    'firstName,lastName,email,phone,dateOfBirth,gender,district,country',
  guests:
    'First Name,Last Name,Phone,Email,Address,How Did You Hear About Us,How May We Pray For You,Service Date',
  believers:
    'First Name,Last Name,Phone,Email,Address,Led to Christ By,Led to Christ On,Notes',
  redzone: 'First Name,Last Name,Phone,Email,Gender,Notes',
};

const UPLOAD_LABELS: Record<UploadMode, string> = {
  contacts: 'Upload Contacts',
  guests: 'Upload Guests',
  believers: 'Upload Believers',
  redzone: 'Upload Red Zone',
};

const EMPTY_SERVICE_SUMMARY: BulkUploadSummary = {
  total: 0,
  created: 0,
  linked: 0,
  errors: [],
};

function downloadTemplate(mode: UploadMode) {
  const blob = new Blob([TEMPLATES[mode] + '\n'], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mode}-template.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const BulkUpload = ({ onComplete, onCancel }: BulkUploadProps) => {
  const [mode, setMode] = useState<UploadMode>('contacts');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleModeChange = (
    _: React.MouseEvent<HTMLElement>,
    val: UploadMode | null,
  ) => {
    if (val) {
      setMode(val);
      setFile(null);
      setResult(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    if (mode === 'contacts') {
      const formData = new FormData();
      formData.append('file', file);
      postFile(
        remoteRoutes.contactsPeopleUpload,
        formData,
        (response) => {
          const backendMessage = extractBadRequestErrorMessage(
            response?.message,
            response?.errors,
          );
          const normalizedErrors = Array.isArray(response?.errors)
            ? response.errors
            : !response?.success && backendMessage !== 'Invalid request format'
            ? [backendMessage]
            : [];

          setResult({
            type: 'contacts',
            success: !!response?.success,
            totalRows: Number(response?.totalRows ?? 0),
            successfulRows: Number(response?.successfulRows ?? 0),
            errors: normalizedErrors,
          });
          setUploading(false);
        },
        (error, response) => {
          console.error('Upload error:', error);
          const responseData = error?.response?.data || response?.data;
          const backendMessage = extractBadRequestErrorMessage(
            responseData?.message,
            responseData?.errors,
          );
          const errorMessage =
            backendMessage !== 'Invalid request format'
              ? backendMessage
              : error?.message && !String(error.message).includes('status code')
              ? error.message
              : 'Upload failed. Please try again.';

          setResult({
            type: 'contacts',
            success: false,
            totalRows: 0,
            successfulRows: 0,
            errors: [errorMessage],
          });
          setUploading(false);
        },
      );
    } else {
      const serviceUploader =
        mode === 'guests'
          ? serviceRecordingApi.bulkUploadGuests
          : mode === 'believers'
          ? serviceRecordingApi.bulkUploadBelievers
          : serviceRecordingApi.bulkUploadRedZone;

      try {
        const summary = await serviceUploader(file);
        setResult({ type: 'service', summary });
      } catch (error: any) {
        const responseData = error?.response?.data;
        const backendMessage = extractBadRequestErrorMessage(
          responseData?.message,
          responseData?.errors,
        );
        const errorMessage =
          backendMessage !== 'Invalid request format'
            ? backendMessage
            : error?.message && !String(error.message).includes('status code')
            ? error.message
            : 'Upload failed. Please try again.';

        setResult({
          type: 'service',
          summary: EMPTY_SERVICE_SUMMARY,
          error: errorMessage,
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const isSuccess =
    (result?.type === 'contacts' && result.success) ||
    (result?.type === 'service' && !result.error);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Bulk Upload
      </Typography>

      {/* Mode toggle */}
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleModeChange}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="contacts">Contacts</ToggleButton>
        <ToggleButton value="guests">First-time Guests</ToggleButton>
        <ToggleButton value="believers">New Believers</ToggleButton>
        <ToggleButton value="redzone">Red Zone</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="body2" color="text.secondary" paragraph>
        Upload a CSV file. Make sure your file includes the required columns.
      </Typography>

      {/* Sample Download */}
      <Box mb={3}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => downloadTemplate(mode)}
          size="small"
        >
          Download Sample CSV
        </Button>
      </Box>

      {/* File Selection */}
      <Box mb={3}>
        <input
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ py: 2 }}
          >
            {file ? file.name : 'Select CSV or Excel File'}
          </Button>
        </label>
      </Box>

      {file && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </Alert>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Box mb={2}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Uploading and processing...
          </Typography>
        </Box>
      )}

      {/* Upload Results — Contacts */}
      {result?.type === 'contacts' && (
        <Box mb={2}>
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 2 }}>
            {result.success
              ? `Successfully imported ${result.successfulRows} of ${result.totalRows} contacts`
              : 'Upload failed'}
          </Alert>

          {(result.errors?.length ?? 0) > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Issues Found:
              </Typography>
              <List dense>
                {result.errors.slice(0, 10).map((error, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
                {result.errors.length > 10 && (
                  <ListItem>
                    <ListItemText
                      primary={`... and ${
                        result.errors.length - 10
                      } more errors`}
                      sx={{ fontStyle: 'italic' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </Box>
      )}

      {/* Upload Results — Guests / Believers / Red Zone */}
      {result?.type === 'service' && (
        <Box mb={2}>
          <Alert severity={result.error ? 'error' : 'success'} sx={{ mb: 2 }}>
            {result.error
              ? result.error
              : `${result.summary.created} new contact${
                  result.summary.created !== 1 ? 's' : ''
                } created, ${
                  result.summary.linked
                } linked to existing contacts.`}
          </Alert>

          {result.summary.errors.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {result.summary.errors.length} row
              {result.summary.errors.length !== 1 ? 's' : ''} had issues:
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                {result.summary.errors.map((e) => (
                  <li key={e.row}>
                    Row {e.row} — {e.name || 'Unknown'}: {e.error}
                  </li>
                ))}
              </Box>
            </Alert>
          )}

        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Column instructions */}
      {mode === 'contacts' && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Required CSV Columns:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>firstName</strong> - First name (required)
            <br />• <strong>lastName</strong> - Last name (required)
            <br />• <strong>email</strong> - Email address (required — used for
            login)
            <br />• <strong>phone</strong> - Phone number
            <br />• <strong>dateOfBirth</strong> - Date of birth (YYYY-MM-DD
            format)
            <br />• <strong>gender</strong> - Gender (Male/Female)
            <br />• <strong>country</strong> - Country (required)
            <br />
          </Typography>
        </Box>
      )}

      {mode === 'guests' && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Required columns:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>firstName</strong> - First name (required)
            <br />• <strong>lastName</strong> - Last name (required)
            <br />• <strong>phone</strong> - Phone number
            <br />
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Optional columns:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>email</strong> - Email address
            <br />• <strong>Address</strong>
            <br />• <strong>How Did You Hear About Us</strong>
            <br />• <strong>How May We Pray For You</strong>
            <br />• <strong>Church Location</strong> — defaults to your location
            if blank
            <br />• <strong>Service Date</strong> — YYYY-MM-DD or DD/MM/YYYY,
            defaults to today if blank
            <br />
          </Typography>
        </Box>
      )}

      {mode === 'believers' && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Required columns:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>firstName</strong> - First name (required)
            <br />• <strong>lastName</strong> - Last name (required)
            <br />• <strong>phone</strong> - Phone number
            <br />
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Optional columns:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>email</strong> - Email address
            <br />• <strong>Address</strong>
            <br />• <strong>Led to Christ By</strong>
            <br />• <strong>Led to Christ On</strong> — YYYY-MM-DD or
            DD/MM/YYYY, defaults to today if blank
            <br />• <strong>Notes</strong>
            <br />
          </Typography>
        </Box>
      )}

      {mode === 'redzone' && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Use these CSV columns:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>First Name</strong>
            <br />• <strong>Last Name</strong>
            <br />• <strong>Phone</strong>
            <br />• <strong>Email</strong>
            <br />• <strong>Gender</strong>
            <br />• <strong>Notes</strong>
            <br />• <strong>Church Location</strong>
            <br />
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        {!isSuccess && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : UPLOAD_LABELS[mode]}
          </Button>
        )}
        {isSuccess && (
          <Button
            variant="contained"
            color="success"
            onClick={onComplete}
            startIcon={<CheckIcon />}
          >
            Done
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BulkUpload;
