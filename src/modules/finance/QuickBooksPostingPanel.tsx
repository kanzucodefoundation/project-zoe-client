import { useMemo, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-toastify';
import { getAsync, postAsync } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

// ── Setup wizard types ────────────────────────────────────────────────────────

interface QboOption {
  id: string;
  name: string;
}

interface CustomerCreateDefaults {
  displayName: string;
  givenName?: string;
  familyName?: string;
  primaryPhone?: string;
  primaryEmail?: string;
}

interface MissingMappingItem {
  code: string;
  internalReferenceType: string;
  internalReferenceId: string | number;
  internalName: string;
  externalReferenceType: string;
  qboOptions: QboOption[];
  creatable: boolean;
  createDefaults?: CustomerCreateDefaults;
  suggestedOptionId?: string | null;
  suggestionReason?: string | null;
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
  class: { groupName: string; isFallback: boolean } | null;
}

interface SalesReceiptPreview {
  transactionDate: string;
  referenceNumber: string | null;
  customer: { contactName: string };
  depositAccount: { financialAccountName: string };
  location: { groupName: string; isFallback: boolean } | null;
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

/** Sentinel option id meaning "provision this record in QuickBooks instead". */
const CREATE_NEW = '__create_new__';

const externalTypeLabel: Record<string, string> = {
  CUSTOMER: 'QuickBooks customer',
  ITEM: 'QuickBooks product/service',
  ACCOUNT: 'QuickBooks account',
  LOCATION: 'QuickBooks location',
  CLASS: 'QuickBooks class',
};

const internalTypeLabel: Record<string, string> = {
  CONTACT: 'Giver',
  GIVING_CATEGORY: 'Giving category',
  FINANCIAL_ACCOUNT: 'Deposit account',
  GROUP: 'Group',
};

/**
 * When a giver belongs to no Location or FOB, the gift is attributed to the
 * mother group instead of blocking. That row needs explaining; the per-record
 * rows do not.
 */
const fallbackHint: Record<string, string> = {
  DEFAULT_LOCATION_MAPPING_MISSING:
    'This giver is not in any Location group, so the gift is attributed to the mother group. Map it once and every unplaced giver is covered.',
  DEFAULT_CLASS_MAPPING_MISSING:
    'This giver is not in any FOB group, so the gift is attributed to the mother group. Map it once and every unplaced giver is covered.',
};

/** Server errors arrive as Errors carrying the API's message; anything else is a bug. */
function messageOf(e: unknown): string | undefined {
  return e instanceof Error ? e.message : undefined;
}

function mappingKey(m: MissingMappingItem) {
  return `${m.internalReferenceType}__${m.internalReferenceId}__${m.externalReferenceType}`;
}

type Choice = QboOption & { isCreate?: boolean };

// ── Component ─────────────────────────────────────────────────────────────────

type Stage =
  | 'idle'
  | 'checking'
  | 'setup'
  | 'saving'
  | 'preview'
  | 'posting'
  | 'done'
  | 'error';

interface Props {
  transactionId: number;
  onPosted?: () => void;
}

export default function QuickBooksPostingPanel({
  transactionId,
  onPosted,
}: Props) {
  const theme = useTheme();
  // Dialogs fill the screen on a phone, as they do elsewhere in the app.
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [createForms, setCreateForms] = useState<
    Record<string, CustomerCreateDefaults>
  >({});
  const [preview, setPreview] = useState<SalesReceiptPreview | null>(null);
  const [postingResult, setPostingResult] = useState<PostingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const base = remoteRoutes.financialAccounting(transactionId);


  /** Applies a setup payload to local state, jumping to preview when ready. */
  const applyResult = async (result: SetupResult) => {
    if (result.ready) {
      const receiptPreview = await getAsync<SalesReceiptPreview>(
        `${base}/preview`,
      );
      setPreview(receiptPreview);
      setStage('preview');
      return;
    }
    setSetupResult(result);
    // Pre-select the server's suggested match so the operator confirms rather
    // than hunts through a long list.
    setSelections(
      Object.fromEntries(
        result.missingMappings
          .filter((m) => !!m.suggestedOptionId)
          .map((m) => [mappingKey(m), m.suggestedOptionId as string]),
      ),
    );
    setCreateForms({});
    setStage('setup');
  };

  const handleOpen = async () => {
    setOpen(true);
    setStage('checking');
    setSetupResult(null);
    setSelections({});
    setCreateForms({});
    setPreview(null);
    setPostingResult(null);
    setErrorMessage(null);
    try {
      await applyResult(await getAsync<SetupResult>(`${base}/setup`));
    } catch (e: unknown) {
      setErrorMessage(messageOf(e) ?? null);
      setStage('error');
    }
  };

  const handleSaveMappings = async () => {
    if (!setupResult) return;
    setStage('saving');
    setErrorMessage(null);
    try {
      const mappings = setupResult.missingMappings.map((m) => {
        const key = mappingKey(m);
        const selectedId = selections[key];
        const common = {
          internalReferenceType: m.internalReferenceType,
          internalReferenceId: m.internalReferenceId,
          externalReferenceType: m.externalReferenceType,
        };
        if (selectedId === CREATE_NEW) {
          return { ...common, action: 'create' as const, create: createForms[key] };
        }
        return {
          ...common,
          action: 'link' as const,
          externalReferenceId: selectedId,
          externalReferenceName: m.qboOptions.find((o) => o.id === selectedId)
            ?.name,
        };
      });

      await applyResult(await postAsync<SetupResult>(`${base}/setup`, { mappings }));
    } catch (e: unknown) {
      // Keep the operator on the form with their entries intact — the common
      // failure here is a duplicate customer name, which they can just edit.
      setErrorMessage(messageOf(e) ?? 'Could not save the mappings.');
      setStage('setup');
    }
  };

  const handlePost = async () => {
    setStage('posting');
    try {
      const result = await postAsync<PostingResult>(`${base}/post`, {});
      setPostingResult(result);
      setStage('done');
      if (result.status === 'POSTED') {
        toast.success(
          `Posted to QuickBooks — receipt ${
            result.externalDocumentNumber ?? result.externalDocumentId
          }`,
        );
        onPosted?.();
      } else if (result.status === 'PENDING') {
        // Recorded but not yet confirmed. Calling this a failure would invite a
        // retry, and retrying is unsafe without an idempotency guarantee.
        toast.info('Posting recorded — awaiting confirmation from QuickBooks');
      } else {
        toast.error('Posting failed — see details in panel');
      }
    } catch (e: unknown) {
      setErrorMessage(messageOf(e) ?? null);
      setStage('error');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStage('idle');
  };

  const setSelection = (key: string, value: string, m: MissingMappingItem) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
    if (value === CREATE_NEW && !createForms[key]) {
      setCreateForms((prev) => ({
        ...prev,
        [key]: m.createDefaults ?? { displayName: m.internalName },
      }));
    }
  };

  const setCreateField = (
    key: string,
    field: keyof CustomerCreateDefaults,
    value: string,
  ) => {
    setCreateForms((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const missingMappings = useMemo(
    () => setupResult?.missingMappings ?? [],
    [setupResult],
  );
  const dataIssues = setupResult?.dataIssues ?? [];

  const allMappingsFilled = useMemo(
    () =>
      missingMappings.every((m) => {
        const key = mappingKey(m);
        const selected = selections[key];
        if (!selected) return false;
        if (selected === CREATE_NEW) {
          return !!createForms[key]?.displayName?.trim();
        }
        return true;
      }),
    [missingMappings, selections, createForms],
  );

  const hasMappableBlockers = missingMappings.length > 0;
  const hasDataIssuesOnly = !hasMappableBlockers && dataIssues.length > 0;

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

      <Dialog open={open} onClose={handleClose} maxWidth="sm"
        fullWidth
        fullScreen={isPhone}
      >
        <DialogTitle>Post to QuickBooks</DialogTitle>

        <DialogContent dividers>
          {/* ── Spinners ── */}
          {(stage === 'checking' ||
            stage === 'saving' ||
            stage === 'posting') && (
            <Stack alignItems="center" py={3} gap={1}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                {stage === 'checking' && 'Checking readiness…'}
                {stage === 'saving' && 'Saving to QuickBooks…'}
                {stage === 'posting' && 'Posting to QuickBooks…'}
              </Typography>
            </Stack>
          )}

          {/* ── Setup wizard ── */}
          {stage === 'setup' && setupResult && (
            <Box>
              {setupResult.contact && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Giving transaction for{' '}
                  <strong>{setupResult.contact.name}</strong>
                </Typography>
              )}

              {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMessage}
                </Alert>
              )}

              {/* Data issues — not fixable from this dialog */}
              {dataIssues.map((issue) => (
                <Alert severity="warning" key={issue.code} sx={{ mb: 1 }}>
                  {issue.message}
                </Alert>
              ))}

              {/* Missing mappings — resolved inline */}
              {hasMappableBlockers && (
                <>
                  <Typography variant="body2" fontWeight={600} mt={2} mb={1.5}>
                    Match each item below to QuickBooks
                  </Typography>

                  <Stack gap={2}>
                    {missingMappings.map((m) => {
                      const key = mappingKey(m);
                      const selected = selections[key] ?? '';
                      const isCreating = selected === CREATE_NEW;
                      const form = createForms[key];

                      const choices: Choice[] = [
                        ...(m.creatable
                          ? [
                              {
                                id: CREATE_NEW,
                                name: `Create “${
                                  m.createDefaults?.displayName ?? m.internalName
                                }” as a new customer`,
                                isCreate: true,
                              },
                            ]
                          : []),
                        ...m.qboOptions,
                      ];
                      const value =
                        choices.find((c) => c.id === selected) ?? null;
                      const showSuggestion =
                        !!m.suggestionReason &&
                        selected === m.suggestedOptionId;

                      return (
                        <Paper
                          key={key}
                          variant="outlined"
                          sx={{ p: 2, borderRadius: 2 }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={1}
                          >
                            {internalTypeLabel[m.internalReferenceType] ??
                              m.internalReferenceType}
                            {' · '}
                            <Box component="span" fontWeight={600}>
                              {m.internalName}
                            </Box>
                          </Typography>

                          {fallbackHint[m.code] && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={1.5}
                            >
                              {fallbackHint[m.code]}
                            </Typography>
                          )}

                          <Autocomplete
                            size="small"
                            fullWidth
                            options={choices}
                            value={value}
                            getOptionLabel={(o) => o.name}
                            isOptionEqualToValue={(o, v) => o.id === v.id}
                            onChange={(_, next) =>
                              setSelection(key, next?.id ?? '', m)
                            }
                            renderOption={(props, option) => {
                              const { key: optKey, ...rest } =
                                props as typeof props & { key: string };
                              return (
                                <Box
                                  component="li"
                                  key={optKey}
                                  {...rest}
                                  sx={{ gap: 1 }}
                                >
                                  {option.isCreate && (
                                    // Inherits the row's text colour. The theme's
                                    // primary is a near-black navy in both light
                                    // and dark mode, so colouring this by palette
                                    // made it unreadable on a dark menu.
                                    <AddCircleOutlineIcon
                                      fontSize="small"
                                      color="inherit"
                                    />
                                  )}
                                  <Typography
                                    variant="body2"
                                    color="text.primary"
                                    fontWeight={option.isCreate ? 600 : 400}
                                  >
                                    {option.name}
                                  </Typography>
                                  {option.id === m.suggestedOptionId && (
                                    <Chip
                                      label="suggested"
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      sx={{ ml: 'auto' }}
                                    />
                                  )}
                                </Box>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={
                                  externalTypeLabel[m.externalReferenceType] ??
                                  m.externalReferenceType
                                }
                                placeholder="Search…"
                              />
                            )}
                          />

                          {showSuggestion && (
                            <Stack
                              direction="row"
                              alignItems="center"
                              gap={0.5}
                              mt={0.75}
                            >
                              <AutoAwesomeIcon
                                sx={{ fontSize: 14 }}
                                color="success"
                              />
                              <Typography
                                variant="caption"
                                color="success.main"
                              >
                                Suggested — {m.suggestionReason}. Confirm or
                                pick another.
                              </Typography>
                            </Stack>
                          )}

                          {m.creatable &&
                            m.qboOptions.length === 0 &&
                            !isCreating && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                mt={0.75}
                              >
                                No matching customer in QuickBooks yet — create
                                one from this list.
                              </Typography>
                            )}

                          {/* Inline "new customer" form */}
                          {isCreating && form && (
                            <Box mt={2}>
                              <Alert
                                severity="info"
                                icon={<AddCircleOutlineIcon fontSize="small" />}
                                sx={{ mb: 1.5, py: 0.5 }}
                              >
                                A new customer will be created in QuickBooks and
                                linked to this giver.
                              </Alert>
                              <Stack gap={1.5}>
                                <TextField
                                  size="small"
                                  fullWidth
                                  required
                                  label="Display name"
                                  helperText="Must be unique in QuickBooks"
                                  value={form.displayName ?? ''}
                                  error={!form.displayName?.trim()}
                                  onChange={(e) =>
                                    setCreateField(
                                      key,
                                      'displayName',
                                      e.target.value,
                                    )
                                  }
                                />
                                <Stack direction="row" gap={1.5}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    label="First name"
                                    value={form.givenName ?? ''}
                                    onChange={(e) =>
                                      setCreateField(
                                        key,
                                        'givenName',
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <TextField
                                    size="small"
                                    fullWidth
                                    label="Last name"
                                    value={form.familyName ?? ''}
                                    onChange={(e) =>
                                      setCreateField(
                                        key,
                                        'familyName',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </Stack>
                                <Stack direction="row" gap={1.5}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    label="Phone"
                                    value={form.primaryPhone ?? ''}
                                    onChange={(e) =>
                                      setCreateField(
                                        key,
                                        'primaryPhone',
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <TextField
                                    size="small"
                                    fullWidth
                                    label="Email"
                                    value={form.primaryEmail ?? ''}
                                    onChange={(e) =>
                                      setCreateField(
                                        key,
                                        'primaryEmail',
                                        e.target.value,
                                      )
                                    }
                                  />
                                </Stack>
                              </Stack>
                            </Box>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                </>
              )}

              {hasDataIssuesOnly && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  These need to be fixed in the CRM before this transaction can
                  be posted.
                </Typography>
              )}
            </Box>
          )}

          {/* ── Preview ── */}
          {stage === 'preview' && preview && (
            <Box>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <CheckCircleOutlineIcon color="success" />
                <Typography fontWeight={600}>
                  Ready to post — review before confirming
                </Typography>
              </Stack>
              <Stack gap={0.5}>
                <Row label="Customer" value={preview.customer.contactName} />
                <Row label="Date" value={preview.transactionDate} />
                {preview.referenceNumber && (
                  <Row label="Reference" value={preview.referenceNumber} />
                )}
                <Row
                  label="Deposit To"
                  value={preview.depositAccount.financialAccountName}
                />
                {preview.location && (
                  <Row
                    label="Location"
                    value={preview.location.groupName}
                    note={preview.location.isFallback ? 'default' : undefined}
                  />
                )}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
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
                      {li.class.isFallback && ' (default)'}
                    </Typography>
                  )}
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {preview.currency} {Number(preview.totalAmount).toLocaleString()}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* ── Done ── */}
          {stage === 'done' && postingResult && (
            <Box>
              {postingResult.status === 'PENDING' ? (
                <Stack alignItems="center" gap={1} py={2}>
                  <CircularProgress size={32} />
                  <Typography fontWeight={600}>Awaiting QuickBooks</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    The posting was recorded but QuickBooks has not confirmed a
                    receipt yet. Re-open this panel later to see the outcome.
                  </Typography>
                </Stack>
              ) : postingResult.status === 'POSTED' ? (
                <Stack alignItems="center" gap={1} py={2}>
                  <CheckCircleOutlineIcon
                    color="success"
                    sx={{ fontSize: 40 }}
                  />
                  <Typography fontWeight={600}>Posted successfully</Typography>
                  {postingResult.externalDocumentNumber && (
                    <Chip
                      label={`Receipt #${postingResult.externalDocumentNumber}`}
                      color="success"
                      size="small"
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    QBO ID: {postingResult.externalDocumentId}
                  </Typography>
                </Stack>
              ) : (
                <Alert severity="error">
                  <AlertTitle>Posting failed</AlertTitle>
                  {postingResult.errorMessage}
                </Alert>
              )}
            </Box>
          )}

          {/* ── Error ── */}
          {stage === 'error' && (
            <Stack alignItems="center" gap={1} py={2}>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
              <Typography color="error" textAlign="center">
                {errorMessage ?? 'Something went wrong. Please try again.'}
              </Typography>
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
              Save &amp; Continue
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

function Row({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Typography variant="body2" color="text.secondary" minWidth={110}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
      {note && (
        <Chip label={note} size="small" variant="outlined" sx={{ height: 18 }} />
      )}
    </Stack>
  );
}
