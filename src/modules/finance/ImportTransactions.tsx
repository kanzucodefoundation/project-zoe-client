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
  AlertTitle,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, postAsync, postFile } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
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

  /**
   * Where to pick up after a run that died part-way through.
   *
   * The server commits each batch as it arrives and has no idea it is part of a
   * larger run, so the rows that landed before the failure are already saved.
   * Starting over would send them a second time, and `importParsed` saves every
   * row it is given without looking for an existing one — there is no natural
   * key and no unique constraint behind it, so the duplicates would stick, and
   * a duplicated gift is not something you can tell apart afterwards.
   *
   * Holding the offset lets the operator resume from the first row the server
   * never saw instead.
   */
  /** Set synchronously so a double-click cannot start a second import run. */
  const importInFlightRef = useRef(false);

  const [resumeFrom, setResumeFrom] = useState<{
    /** Offset into the valid rows — what the next run slices from. */
    index: number;
    /** That row's number as the preview table shows it, which is what the operator reads. */
    rowLabel: number;
    imported: number;
    errors: number;
    reason: string;
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
        // Only an option backed by a Zoe category can be a fallback. Picking
        // an unmapped QuickBooks item would file rows under a category they do
        // not belong to.
        const fallback =
          data.find((option) => option.selectable && option.isDefault) ??
          data.find((option) => option.selectable);
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

    // Goes through the shared client so the request picks up the auth header,
    // the timeout and the app's session-expiry handling, rather than a bare
    // fetch that reimplements only the token.
    postFile(
      `${remoteRoutes.financialTransactions}/parse`,
      formData,
      (data: ParsedTransaction[]) => {
        setParsedTransactions(data);
        setActiveStep(2);
        setParsing(false);
      },
      (err: unknown) => {
        setParseError(
          err instanceof Error && err.message
            ? err.message
            : 'Failed to parse file',
        );
        setParsing(false);
      },
    );
  };

  /**
   * Rows per request. A whole statement in one body runs past the server's JSON
   * limit, so the reviewed rows go up in batches — which also gives the
   * operator progress instead of one long silence.
   */
  const IMPORT_CHUNK_SIZE = 250;

  /**
   * Send the reviewed rows from `startAt` onwards.
   *
   * `startAt` is non-zero only when resuming: every row before it is already on
   * the server from the run that failed, and re-sending it would duplicate it.
   */
  const runImport = async (
    startAt: number,
    alreadyImported: number,
    priorErrors: number,
  ) => {
    const validTransactions = parsedTransactions.filter((t) => t.isValid);
    if (validTransactions.length === 0) {
      toast.error('No valid transactions to import');
      return;
    }
    // `importing` cannot guard this alone: two clicks in the same frame both
    // read it from before the first set it, and the statement would be imported
    // twice. The server does not deduplicate, so that would stick.
    if (importInFlightRef.current) return;
    importInFlightRef.current = true;

    setImporting(true);
    setResumeFrom(null);
    setImportProgress({ done: startAt, total: validTransactions.length });

    let imported = alreadyImported;
    // Only the count is carried: the per-row messages are the server's, and a
    // resumed run must not double-count the ones the earlier run already showed.
    let errorCount = priorErrors;

    for (let i = startAt; i < validTransactions.length; i += IMPORT_CHUNK_SIZE) {
      const chunk = validTransactions.slice(i, i + IMPORT_CHUNK_SIZE);

      try {
        const result = await postAsync<{
          imported: number;
          errors: string[];
        }>(`${remoteRoutes.financialTransactions}/import`, {
          accountId: config.accountId,
          transactions: chunk,
        });
        imported += result.imported;
        if (result.errors?.length) {
          errorCount += result.errors.length;
        }
        setImportProgress({
          done: Math.min(i + chunk.length, validTransactions.length),
          total: validTransactions.length,
        });
      } catch (e: unknown) {
        // This batch never landed, so `i` is the first row the server has not
        // seen. Stop here and offer to resume from it: carrying on would leave
        // a hole in the middle of the statement, and starting over would send
        // the rows before it twice.
        const reason = e instanceof Error ? e.message : 'Import failed';
        importInFlightRef.current = false;
        setResumeFrom({
          index: i,
          rowLabel: validTransactions[i]?.rowIndex ?? i + 1,
          imported,
          errors: errorCount,
          reason,
        });
        setImporting(false);
        setImportProgress(null);
        toast.error(
          `${reason}${
            imported > 0 ? ` — ${imported} rows were saved before this` : ''
          }`,
        );
        return;
      }
    }

    importInFlightRef.current = false;
    setImportResult({ imported, errors: errorCount });
    toast.success(`Imported ${imported} transactions`);
    if (errorCount > 0) {
      toast.warning(`${errorCount} rows were rejected`);
    }
    setImporting(false);
    setImportProgress(null);
  };

  const handleImport = () => runImport(0, 0, 0);

  const handleResumeImport = () => {
    if (!resumeFrom) return;
    runImport(resumeFrom.index, resumeFrom.imported, resumeFrom.errors);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setParsedTransactions([]);
    setImportResult(null);
    setResumeFrom(null);
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
                        disabled={!option.selectable}
                      >
                        {option.label}
                        {!option.selectable && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            not linked to a Zoe category
                          </Typography>
                        )}
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

                {resumeFrom && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <AlertTitle>
                      Import stopped after{' '}
                      {resumeFrom.imported.toLocaleString()} of{' '}
                      {validCount.toLocaleString()} rows
                    </AlertTitle>
                    <Typography variant="body2" gutterBottom>
                      {resumeFrom.reason}
                    </Typography>
                    <Typography variant="body2">
                      Everything before row{' '}
                      {resumeFrom.rowLabel.toLocaleString()} is already saved.{' '}
                      <strong>Resume</strong> sends only what is left. Starting
                      over would import the saved rows a second time, and
                      duplicate giving records cannot be told apart afterwards.
                    </Typography>
                  </Alert>
                )}

                <Box display="flex" gap={2}>
                  <Button variant="outlined" onClick={handleReset} disabled={importing}>
                    Start Over
                  </Button>
                  {resumeFrom ? (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleResumeImport}
                      disabled={importing}
                      startIcon={
                        importing ? <CircularProgress size={20} /> : null
                      }
                    >
                      {importing
                        ? 'Importing...'
                        : `Resume from row ${resumeFrom.rowLabel.toLocaleString()}`}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleImport}
                      disabled={importing || validCount === 0}
                      startIcon={
                        importing ? <CircularProgress size={20} /> : null
                      }
                    >
                      {importing
                        ? 'Importing...'
                        : `Import ${validCount} Transactions`}
                    </Button>
                  )}
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
