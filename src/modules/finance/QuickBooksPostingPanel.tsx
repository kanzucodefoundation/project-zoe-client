import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

// ── Setup wizard types ────────────────────────────────────────────────────────

interface QboOption {
  id: string;
  name: string;
}

interface MissingMappingItem {
  code: string;
  internalReferenceType: string;
  internalReferenceId: string | number;
  internalName: string;
  externalReferenceType: string;
  qboOptions: QboOption[];
}

interface DataIssue {
  code: string;
  message: string;
  contactId?: number;
}

interface SetupResult {
  ready: boolean;
  contact?: { id: number; name: string };
  missingMappings: MissingMappingItem[];
  dataIssues: DataIssue[];
}

// ── Preview / posting types ───────────────────────────────────────────────────

interface LineItem {
  category: string;
  description: string;
  quantity: number;
  amount: number;
  serviceDate: string;
  class: { groupName: string } | null;
}

interface SalesReceiptPreview {
  transactionDate: string;
  referenceNumber: string | null;
  customer: { contactName: string };
  depositAccount: { financialAccountName: string };
  location: { groupName: string } | null;
  lineItems: LineItem[];
  totalAmount: number;
  currency: string;
}

interface PostingResult {
  status: 'POSTED' | 'FAILED' | 'PENDING';
  externalDocumentId: string | null;
  externalDocumentNumber: string | null;
  errorMessage: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const externalTypeLabel: Record<string, string> = {
  CUSTOMER: 'QBO Customer',
  ITEM: 'QBO Item',
  ACCOUNT: 'QBO Account',
  LOCATION: 'QBO Location',
  CLASS: 'QBO Class',
};

const internalTypeLabel: Record<string, string> = {
  CONTACT: 'Contact',
  GIVING_CATEGORY: 'Category',
  FINANCIAL_ACCOUNT: 'Financial Account',
  GROUP: 'Group',
};

function mappingKey(m: MissingMappingItem) {
  return `${m.internalReferenceType}__${m.internalReferenceId}__${m.externalReferenceType}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

type Stage = 'idle' | 'checking' | 'setup' | 'saving' | 'preview' | 'posting' | 'done' | 'error';

interface Props {
  transactionId: number;
  onPosted?: () => void;
}

export default function QuickBooksPostingPanel({ transactionId, onPosted }: Props) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<SalesReceiptPreview | null>(null);
  const [postingResult, setPostingResult] = useState<PostingResult | null>(null);

  const base = remoteRoutes.financialAccounting(transactionId);

  const loadSetup = async () => {
    const result: SetupResult = await get(`${base}/setup`);
    if (result.ready) {
      const receiptPreview = await get(`${base}/preview`);
      setPreview(receiptPreview);
      setStage('preview');
    } else {
      setSetupResult(result);
      setSelections({});
      setStage('setup');
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    setStage('checking');
    setSetupResult(null);
    setSelections({});
    setPreview(null);
    setPostingResult(null);
    try {
      await loadSetup();
    } catch {
      setStage('error');
    }
  };

  const handleSaveMappings = async () => {
    if (!setupResult) return;
    setStage('saving');
    try {
      const mappings = setupResult.missingMappings.map((m) => {
        const selectedId = selections[mappingKey(m)];
        const selectedOption = m.qboOptions.find((o) => o.id === selectedId);
        return {
          internalReferenceType: m.internalReferenceType,
          internalReferenceId: m.internalReferenceId,
          externalReferenceType: m.externalReferenceType,
          externalReferenceId: selectedId,
          externalReferenceName: selectedOption?.name,
        };
      });

      const preflight = await post(`${base}/setup`, { mappings });
      if (preflight.ready) {
        const receiptPreview = await get(`${base}/preview`);
        setPreview(receiptPreview);
        setStage('preview');
      } else {
        // Re-fetch setup so any remaining issues show with full context
        await loadSetup();
      }
    } catch {
      setStage('error');
    }
  };

  const handlePost = async () => {
    setStage('posting');
    try {
      const result = await post(`${base}/post`, {});
      setPostingResult(result);
      setStage('done');
      if (result.status === 'POSTED') {
        toast.success(`Posted to QuickBooks — receipt ${result.externalDocumentNumber ?? result.externalDocumentId}`);
        onPosted?.();
      } else {
        toast.error('Posting failed — see details in panel');
      }
    } catch {
      setStage('error');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStage('idle');
  };

  const allMappingsFilled =
    setupResult?.missingMappings.every((m) => !!selections[mappingKey(m)]) ?? false;

  const hasMappableBlockers = (setupResult?.missingMappings.length ?? 0) > 0;
  const hasDataIssuesOnly =
    !hasMappableBlockers && (setupResult?.dataIssues.length ?? 0) > 0;

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="primary"
        startIcon={<ReceiptLongIcon />}
        onClick={handleOpen}
        sx={{ ml: 1 }}
      >
        Post to QuickBooks
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Post to QuickBooks</DialogTitle>

        <DialogContent dividers>
          {/* ── Spinners ── */}
          {(stage === 'checking' || stage === 'saving' || stage === 'posting') && (
            <Stack alignItems="center" py={3} gap={1}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                {stage === 'checking' && 'Checking readiness…'}
                {stage === 'saving' && 'Saving mappings…'}
                {stage === 'posting' && 'Posting to QuickBooks…'}
              </Typography>
            </Stack>
          )}

          {/* ── Setup wizard ── */}
          {stage === 'setup' && setupResult && (
            <Box>
              {setupResult.contact && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Giving transaction for <strong>{setupResult.contact.name}</strong>
                </Typography>
              )}

              {/* Data issues — not fixable inline */}
              {setupResult.dataIssues.map((issue) => (
                <Alert severity="warning" key={issue.code} sx={{ mb: 1 }}>
                  {issue.message}
                </Alert>
              ))}

              {/* Missing mappings — resolve inline */}
              {hasMappableBlockers && (
                <>
                  <Stack direction="row" alignItems="center" gap={1} mb={2}>
                    <ErrorOutlineIcon color="error" fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                      Select the matching QuickBooks record for each item below
                    </Typography>
                  </Stack>

                  <Stack gap={2}>
                    {setupResult.missingMappings.map((m) => (
                      <FormControl key={mappingKey(m)} size="small" fullWidth>
                        <InputLabel>
                          {internalTypeLabel[m.internalReferenceType] ?? m.internalReferenceType}
                          {' '}"{m.internalName}" →{' '}
                          {externalTypeLabel[m.externalReferenceType] ?? m.externalReferenceType}
                        </InputLabel>
                        <Select
                          label={`${internalTypeLabel[m.internalReferenceType] ?? m.internalReferenceType} "${m.internalName}" → ${externalTypeLabel[m.externalReferenceType] ?? m.externalReferenceType}`}
                          value={selections[mappingKey(m)] ?? ''}
                          onChange={(e) =>
                            setSelections((prev) => ({ ...prev, [mappingKey(m)]: e.target.value }))
                          }
                        >
                          {m.qboOptions.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>
                              {opt.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))}
                  </Stack>
                </>
              )}

              {hasDataIssuesOnly && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  These issues must be fixed in the CRM before this transaction can be posted.
                </Typography>
              )}
            </Box>
          )}

          {/* ── Preview ── */}
          {stage === 'preview' && preview && (
            <Box>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <CheckCircleOutlineIcon color="success" />
                <Typography fontWeight={600}>Ready to post — review before confirming</Typography>
              </Stack>
              <Stack gap={0.5}>
                <Row label="Customer" value={preview.customer.contactName} />
                <Row label="Date" value={preview.transactionDate} />
                {preview.referenceNumber && <Row label="Reference" value={preview.referenceNumber} />}
                <Row label="Deposit To" value={preview.depositAccount.financialAccountName} />
                {preview.location && <Row label="Location" value={preview.location.groupName} />}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                LINE ITEMS
              </Typography>
              {preview.lineItems.map((li, i) => (
                <Box key={i} mt={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">{li.category}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {preview.currency} {Number(li.amount).toLocaleString()}
                    </Typography>
                  </Stack>
                  {li.class && (
                    <Typography variant="caption" color="text.secondary">
                      Class: {li.class.groupName}
                    </Typography>
                  )}
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight={600}>Total</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {preview.currency} {Number(preview.totalAmount).toLocaleString()}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* ── Done ── */}
          {stage === 'done' && postingResult && (
            <Box>
              {postingResult.status === 'POSTED' ? (
                <Stack alignItems="center" gap={1} py={2}>
                  <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography fontWeight={600}>Posted successfully</Typography>
                  {postingResult.externalDocumentNumber && (
                    <Chip label={`Receipt #${postingResult.externalDocumentNumber}`} color="success" size="small" />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    QBO ID: {postingResult.externalDocumentId}
                  </Typography>
                </Stack>
              ) : (
                <Stack gap={1}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <ErrorOutlineIcon color="error" />
                    <Typography fontWeight={600}>Posting failed</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {postingResult.errorMessage}
                  </Typography>
                </Stack>
              )}
            </Box>
          )}

          {/* ── Error ── */}
          {stage === 'error' && (
            <Stack alignItems="center" gap={1} py={2}>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
              <Typography color="error">Something went wrong. Please try again.</Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            {stage === 'done' ? 'Close' : 'Cancel'}
          </Button>

          {stage === 'setup' && hasMappableBlockers && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveMappings}
              disabled={!allMappingsFilled}
            >
              Save Mappings & Continue
            </Button>
          )}

          {stage === 'setup' && hasDataIssuesOnly && (
            <Button onClick={handleOpen} variant="outlined">
              Re-check
            </Button>
          )}

          {stage === 'preview' && (
            <Button variant="contained" color="primary" onClick={handlePost}>
              Confirm &amp; Post
            </Button>
          )}

          {stage === 'error' && (
            <Button onClick={handleOpen} variant="outlined">
              Try Again
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" gap={1}>
      <Typography variant="body2" color="text.secondary" minWidth={110}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
