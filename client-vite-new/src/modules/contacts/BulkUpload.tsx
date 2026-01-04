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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { postFile } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface BulkUploadProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

interface UploadResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  errors: string[];
}

const BulkUpload = ({ onComplete, onCancel }: BulkUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    postFile(
      remoteRoutes.contactsPeopleUpload,
      formData,
      (response) => {
        console.log('Upload success:', response);
        setResult(response);
        setUploading(false);
      },
      (error) => {
        console.error('Upload error:', error);
        setResult({
          success: false,
          totalRows: 0,
          successfulRows: 0,
          errors: ['Upload failed. Please try again.'],
        });
        setUploading(false);
      }
    );
  };

  const downloadSample = () => {
    // Create a sample CSV content
    const sampleData = [
      ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'],
      ['John', 'Doe', 'john.doe@example.com', '+1234567890', '1990-01-15', 'Male'],
      ['Jane', 'Smith', 'jane.smith@example.com', '+1234567891', '1985-03-22', 'Female'],
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts_sample.csv';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Bulk Upload Contacts
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload a CSV file with contact information. Make sure your file includes the required columns.
      </Typography>

      {/* Sample Download */}
      <Box mb={3}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadSample}
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
            Uploading and processing contacts...
          </Typography>
        </Box>
      )}

      {/* Upload Results */}
      {result && (
        <Box mb={2}>
          <Alert 
            severity={result.success ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {result.success 
              ? `Successfully imported ${result.successfulRows} of ${result.totalRows} contacts`
              : 'Upload failed'
            }
          </Alert>

          {result.errors.length > 0 && (
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
                      primary={`... and ${result.errors.length - 10} more errors`}
                      sx={{ fontStyle: 'italic' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Instructions */}
      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>
          Required CSV Columns:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>firstName</strong> - First name (required)<br />
          • <strong>lastName</strong> - Last name (required)<br />
          • <strong>email</strong> - Email address<br />
          • <strong>phone</strong> - Phone number<br />
          • <strong>dateOfBirth</strong> - Date of birth (YYYY-MM-DD format)<br />
          • <strong>gender</strong> - Gender (Male/Female/Other)<br />
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Contacts'}
        </Button>
        {result?.success && (
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