import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  FormHelperText,
  Switch,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, postAsync } from '../../utils/ajax';
import { remoteRoutes, AUTH_TOKEN_KEY } from '../../data/constants';
import type {
  FinancialAccount,
  GivingCategoryOption,
  ParsedTransaction,
  TransactionCategory,
  TransactionImportConfig,
} from './types';

const steps = ['Select Account', 'Upload File', 'Review & Import'];

const ImportTransactions = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<GivingCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Config
  const [config, setConfig] = useState<TransactionImportConfig>({
    accountId: 0,
    defaultCategory: 'TITHE' as TransactionCategory,
    defaultItemId: null,
    defaultItemName: null,
    applyServiceTimeRules: true,
  });

  // Step 2: File
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Step 3: Parsed data
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null);
  const [importProgress, setImportProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    get(
      remoteRoutes.financialAccounts,
      (data: FinancialAccount[]) => {
        const activeAccounts = data.filter((a) => a.isActive);
        setAccounts(activeAccounts);
        if (activeAccounts.length > 0) {
          setConfig((prev) => ({ ...prev, accountId: activeAccounts[0].id }));
        }
        setLoading(false);
      },
      () => {
        toast.error('Failed to load accounts');
        setLoading(false);
      }
    );

    // Categories carry the QuickBooks product/service each one posts to, so the
    // wizard names them the way the books do.
    get(
      remoteRoutes.financialGivingCategories,
      (data: GivingCategoryOption[]) => {
        setCategories(data);
        const fallback = data.find((option) => option.isDefault) ?? data[0];
        if (fallback) {
          setConfig((prev) => ({
            ...prev,
            defaultCategory: (fallback.category ??
              'TITHE') as TransactionCategory,
            defaultItemId: fallback.qboItemId,
            defaultItemName: fallback.qboItemName,
          }));
        }
      },
      () => {},
    );
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.csv', '.xlsx', '.xls'];

    const hasValidExtension = validExtensions.some(ext =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(selectedFile.type) && !hasValidExtension) {
      setParseError('Please upload a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    setParseError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleParseFile = () => {
    if (!file) return;

    setParsing(true);
    setParseError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('accountId', config.accountId.toString());
    formData.append('defaultCategory', config.defaultCategory);
    if (config.defaultItemId) {
      formData.append('defaultItemId', config.defaultItemId);
      formData.append('defaultItemName', config.defaultItemName ?? '');
    }
    formData.append('applyServiceTimeRules', config.applyServiceTimeRules.toString());

    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    fetch(`${remoteRoutes.financialTransactions}/parse`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to parse file');
        return res.json();
      })
      .then((data: ParsedTransaction[]) => {
        setParsedTransactions(data);
        setActiveStep(2);
        setParsing(false);
      })
      .catch((err) => {
        setParseError(err.message || 'Failed to parse file');
        setParsing(false);
      });
  };

  /**
   * Rows per request. A whole statement in one body runs past the server's JSON
   * limit, so the reviewed rows go up in batches — which also gives the
   * operator progress instead of one long silence.
   */
  const IMPORT_CHUNK_SIZE = 250;

  const handleImport = async () => {
    const validTransactions = parsedTransactions.filter((t) => t.isValid);
    if (validTransactions.length === 0) {
      toast.error('No valid transactions to import');
      return;
    }

    setImporting(true);
    setImportProgress({ done: 0, total: validTransactions.length });

    let imported = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < validTransactions.length; i += IMPORT_CHUNK_SIZE) {
        const chunk = validTransactions.slice(i, i + IMPORT_CHUNK_SIZE);
        const result = await postAsync<{
          imported: number;
          errors: string[];
        }>(`${remoteRoutes.financialTransactions}/import`, {
          accountId: config.accountId,
          transactions: chunk,
        });
        imported += result.imported;
        if (result.errors?.length) errors.push(...result.errors);
        setImportProgress({
          done: Math.min(i + chunk.length, validTransactions.length),
          total: validTransactions.length,
        });
      }

      setImportResult({ imported, errors: errors.length });
      toast.success(`Imported ${imported} transactions`);
      if (errors.length > 0) {
        toast.warning(`${errors.length} rows were rejected`);
      }
    } catch (e: unknown) {
      // Whatever landed before the failure is already saved, so say so rather
      // than implying the whole import was lost.
      toast.error(
        `${e instanceof Error ? e.message : 'Import failed'}${
          imported > 0 ? ` — ${imported} rows were saved before this` : ''
        }`,
      );
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setParsedTransactions([]);
    setImportResult(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedTransactions.filter((t) => t.isValid).length;
  const invalidCount = parsedTransactions.filter((t) => !t.isValid).length;

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" mb={3}>
        Import Transactions
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Select Account */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Configure Import
            </Typography>

            {accounts.length === 0 ? (
              <Alert severity="warning">
                No active financial accounts found. Please create an account first.
              </Alert>
            ) : (
              <Box display="flex" flexDirection="column" gap={3} maxWidth={400}>
                <FormControl fullWidth>
                  <InputLabel>Account</InputLabel>
                  <Select
                    value={config.accountId}
                    label="Account"
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, accountId: Number(e.target.value) }))
                    }
                  >
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.name} ({account.accountNumber})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Fallback category</InputLabel>
                  <Select
                    value={config.defaultItemId ?? config.defaultCategory ?? ''}
                    label="Fallback category"
                    onChange={(e) => {
                      const key = e.target.value as string;
                      const option = categories.find(
                        (c) => (c.qboItemId ?? c.category) === key,
                      );
                      setConfig((prev) => ({
                        ...prev,
                        defaultCategory: (option?.category ??
                          'TITHE') as TransactionCategory,
                        defaultItemId: option?.qboItemId ?? null,
                        defaultItemName: option?.qboItemName ?? null,
                      }));
                    }}
                  >
                    {(categories.length > 0
                      ? categories
                      : ([
                          {
                            category: 'TITHE',
                            label: 'Tithe',
                            selectable: true,
                          },
                          {
                            category: 'OFFERING',
                            label: 'Offering',
                            selectable: true,
                          },
                          {
                            category: 'DONATION',
                            label: 'Donation',
                            selectable: true,
                          },
                          {
                            category: 'ARISE_BUILD',
                            label: 'Arise & Build',
                            selectable: true,
                          },
                        ] as GivingCategoryOption[])
                    ).map((option) => (
                      <MenuItem
                        key={option.qboItemId ?? option.category ?? option.label}
                        value={option.qboItemId ?? option.category ?? ''}
                      >
                        {option.label}
                        {option.internalLabel &&
                          option.qboItemName &&
                          option.qboItemName !== option.internalLabel && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              {option.internalLabel}
                            </Typography>
                          )}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Every QuickBooks product and service is listed. Used only
                    when the statement message names none.
                  </FormHelperText>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.applyServiceTimeRules}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          applyServiceTimeRules: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Apply service time rules for category detection"
                />

                <Alert severity="info">
                  Every row is matched to a QuickBooks product or service from
                  the statement message first — <strong>WHARUAYXPOFFERTORY</strong>{' '}
                  books against <strong>Offertory - YXP</strong>, not a generic
                  offering. Names, phone numbers and tithe numbers are cleaned up
                  automatically.
                </Alert>

                <Button
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                  disabled={!config.accountId}
                >
                  Continue
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Step 2: Upload File */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Upload Transaction File
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
            />

            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragging ? 'action.hover' : 'background.paper',
                mb: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.light',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" mb={1}>
                {isDragging
                  ? 'Drop the file here...'
                  : 'Drag and drop a CSV or Excel file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select a file
              </Typography>
            </Box>

            {file && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Selected file: <strong>{file.name}</strong> (
                {(file.size / 1024).toFixed(1)} KB)
              </Alert>
            )}

            {parseError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {parseError}
              </Alert>
            )}

            <Box display="flex" gap={2}>
              <Button variant="outlined" onClick={() => setActiveStep(0)}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleParseFile}
                disabled={!file || parsing}
                startIcon={parsing ? <CircularProgress size={20} /> : null}
              >
                {parsing ? 'Parsing...' : 'Parse File'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Review & Import */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Review Transactions
            </Typography>

            {importResult ? (
              <Box textAlign="center" py={4}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" mb={1}>
                  Import Complete
                </Typography>
                <Typography color="text.secondary" mb={3}>
                  {importResult.imported} transactions imported
                  {importResult.errors > 0 && `, ${importResult.errors} errors`}
                </Typography>
                <Button variant="contained" onClick={handleReset}>
                  Import More
                </Button>
              </Box>
            ) : (
              <>
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`${validCount} valid`}
                    color="success"
                    variant="outlined"
                  />
                  {invalidCount > 0 && (
                    <Chip
                      icon={<ErrorIcon />}
                      label={`${invalidCount} invalid`}
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>

                <TableContainer sx={{ maxHeight: 400, mb: 3 }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Sender</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Tithe no.</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>QuickBooks item</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsedTransactions.map((tx) => (
                        <TableRow
                          key={tx.rowIndex}
                          sx={{
                            bgcolor: tx.isValid ? 'inherit' : 'error.lighter',
                          }}
                        >
                          <TableCell>{tx.rowIndex}</TableCell>
                          <TableCell>
                            {new Date(tx.transactionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {tx.senderName || '-'}
                            {tx.senderPhone && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {tx.senderPhone}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              maxWidth: 180,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {tx.narration || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {tx.titheNumber ? (
                              <Chip
                                label={tx.titheNumber}
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {tx.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Tooltip title={tx.matchedRule ?? ''}>
                              <Chip
                                label={tx.externalItemName ?? tx.category}
                                size="small"
                                color={
                                  tx.matchedRule === 'Default category'
                                    ? 'default'
                                    : 'primary'
                                }
                                variant={
                                  tx.matchedRule === 'Default category'
                                    ? 'outlined'
                                    : 'filled'
                                }
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {tx.isValid ? (
                              <CheckCircleIcon fontSize="small" color="success" />
                            ) : (
                              <Box>
                                <ErrorIcon fontSize="small" color="error" />
                                <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>
                                  {tx.errors?.join(', ')}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {importing && (
                  <Box mb={2}>
                    <LinearProgress
                      variant={importProgress ? 'determinate' : 'indeterminate'}
                      value={
                        importProgress
                          ? (importProgress.done / importProgress.total) * 100
                          : undefined
                      }
                    />
                    {importProgress && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        mt={0.5}
                        display="block"
                      >
                        Imported {importProgress.done.toLocaleString()} of{' '}
                        {importProgress.total.toLocaleString()}…
                      </Typography>
                    )}
                  </Box>
                )}

                <Box display="flex" gap={2}>
                  <Button variant="outlined" onClick={handleReset} disabled={importing}>
                    Start Over
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleImport}
                    disabled={importing || validCount === 0}
                    startIcon={importing ? <CircularProgress size={20} /> : null}
                  >
                    {importing ? 'Importing...' : `Import ${validCount} Transactions`}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ImportTransactions;
