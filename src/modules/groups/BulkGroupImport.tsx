import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  GetApp as DownloadIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  SkipNext as SkipIcon,
} from '@mui/icons-material';
import { postFile, extractBadRequestErrorMessage } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface ImportResult {
  totalRows: number;
  created: { zones: number; sectors: number; mcs: number };
  skipped: { zones: number; sectors: number; mcs: number };
  errors: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = [
  'location,zone,sector,mc',
  'WH Bugolobi,East Zone,Sector A,Bugolobi MC 1',
  'WH Bugolobi,East Zone,Sector A,Bugolobi MC 2',
  'WH Bugolobi,East Zone,Sector B,Bugolobi MC 3',
  'WH Bugolobi,West Zone,,Bugolobi MC 4',
  'WH Ntinda,Central Zone,Sector 1,Ntinda MC 1',
  'WH Ntinda,Central Zone,Sector 2,Ntinda MC 2',
  'WH Ntinda,,,Ntinda MC 3',
].join('\n');

function downloadSample() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bulk-group-import-sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function CountChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'success' | 'default' | 'warning';
}) {
  if (value === 0) return null;
  return (
    <Chip
      label={`${value} ${label}`}
      color={color}
      size="small"
      variant={color === 'default' ? 'outlined' : 'filled'}
    />
  );
}

const BulkGroupImport = ({ open, onClose, onSuccess }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setResult(null);
    onClose();
  };

  const handleDone = () => {
    onSuccess();
    handleClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
    e.target.value = '';
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    postFile(
      remoteRoutes.groupsBulkImport,
      formData,
      (data: ImportResult) => {
        setResult(data);
        setUploading(false);
      },
      (error) => {
        const responseData = error?.response?.data;
        const msg = extractBadRequestErrorMessage(
          responseData?.message,
          responseData?.errors,
        );
        setResult({
          totalRows: 0,
          created: { zones: 0, sectors: 0, mcs: 0 },
          skipped: { zones: 0, sectors: 0, mcs: 0 },
          errors: [msg !== 'Invalid request format' ? msg : 'Upload failed. Please try again.'],
        });
        setUploading(false);
      },
    );
  };

  const totalCreated = result
    ? result.created.zones + result.created.sectors + result.created.mcs
    : 0;
  const hasErrors = (result?.errors?.length ?? 0) > 0;
  const isSuccess = result && totalCreated > 0 && !hasErrors;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Import Groups</DialogTitle>

      <DialogContent dividers>
        {/* Instructions */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload a CSV file to create zones, sectors, and missional communities
          in bulk. Locations must already exist. Duplicate groups are skipped
          safely — re-uploading the same file is harmless.
        </Typography>

        {/* Column guide */}
        <Box
          sx={{
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1,
            px: 2,
            py: 1.5,
            my: 2,
            fontFamily: 'monospace',
            fontSize: 13,
          }}
        >
          <Typography variant="caption" display="block" color="text.secondary" mb={0.5}>
            CSV columns
          </Typography>
          <Box component="span" sx={{ color: 'error.main' }}>location</Box>
          {', '}
          <Box component="span" sx={{ color: 'text.secondary' }}>zone</Box>
          {', '}
          <Box component="span" sx={{ color: 'text.secondary' }}>sector</Box>
          {', '}
          <Box component="span" sx={{ color: 'error.main' }}>mc</Box>
          <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
            <Box component="span" sx={{ color: 'error.main' }}>red</Box> = required &nbsp;
            <Box component="span" sx={{ color: 'text.secondary' }}>grey</Box> = optional (leave blank to skip that level)
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadSample}
          sx={{ mb: 3 }}
        >
          Download sample CSV
        </Button>

        <Divider sx={{ mb: 3 }} />

        {/* File picker */}
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="group-import-file"
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <label htmlFor="group-import-file">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadIcon />}
            fullWidth
            disabled={uploading}
            sx={{ py: 2 }}
          >
            {file ? file.name : 'Select CSV file'}
          </Button>
        </label>

        {file && !result && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {(file.size / 1024).toFixed(1)} KB selected
          </Typography>
        )}

        {/* Progress */}
        {uploading && (
          <Box mt={2}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              Uploading and processing…
            </Typography>
          </Box>
        )}

        {/* Results */}
        {result && (
          <Box mt={3}>
            <Alert
              severity={
                hasErrors && totalCreated === 0
                  ? 'error'
                  : hasErrors
                  ? 'warning'
                  : 'success'
              }
              sx={{ mb: 2 }}
            >
              {totalCreated === 0 && hasErrors
                ? 'Import failed — no groups were created.'
                : `Processed ${result.totalRows} row${result.totalRows !== 1 ? 's' : ''}.`}
            </Alert>

            {/* Created */}
            {totalCreated > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  <CheckIcon
                    color="success"
                    fontSize="small"
                    sx={{ verticalAlign: 'middle', mr: 0.5 }}
                  />
                  Created
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <CountChip label="zones" value={result.created.zones} color="success" />
                  <CountChip label="sectors" value={result.created.sectors} color="success" />
                  <CountChip label="MCs" value={result.created.mcs} color="success" />
                </Stack>
              </Box>
            )}

            {/* Skipped */}
            {(result.skipped.zones + result.skipped.sectors + result.skipped.mcs) > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  <SkipIcon
                    color="action"
                    fontSize="small"
                    sx={{ verticalAlign: 'middle', mr: 0.5 }}
                  />
                  Already existed (skipped)
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <CountChip label="zones" value={result.skipped.zones} color="default" />
                  <CountChip label="sectors" value={result.skipped.sectors} color="default" />
                  <CountChip label="MCs" value={result.skipped.mcs} color="default" />
                </Stack>
              </Box>
            )}

            {/* Errors */}
            {hasErrors && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  <ErrorIcon
                    color="error"
                    fontSize="small"
                    sx={{ verticalAlign: 'middle', mr: 0.5 }}
                  />
                  Errors ({result.errors.length})
                </Typography>
                <List dense disablePadding>
                  {result.errors.slice(0, 15).map((err, i) => (
                    <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={err}
                        slotProps={{ primary: { variant: 'body2' } }}
                      />
                    </ListItem>
                  ))}
                  {result.errors.length > 15 && (
                    <ListItem disablePadding sx={{ py: 0.25 }}>
                      <ListItemText
                        primary={`… and ${result.errors.length - 15} more errors`}
                        slotProps={{
                          primary: {
                            variant: 'body2',
                            sx: { fontStyle: 'italic', color: 'text.secondary' },
                          },
                        }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading…' : 'Import'}
          </Button>
        )}
        {result && (
          <Button
            variant="contained"
            color={isSuccess ? 'success' : 'primary'}
            onClick={handleDone}
            startIcon={isSuccess ? <CheckIcon /> : undefined}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkGroupImport;
