import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface Blocker {
  code: string;
  message: string;
}

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

interface Props {
  transactionId: number;
  onPosted?: () => void;
}

export default function QuickBooksPostingPanel({ transactionId, onPosted }: Props) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'idle' | 'checking' | 'blockers' | 'preview' | 'posting' | 'done' | 'error'>('idle');
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [preview, setPreview] = useState<SalesReceiptPreview | null>(null);
  const [postingResult, setPostingResult] = useState<PostingResult | null>(null);

  const accountingBase = remoteRoutes.financialAccounting(transactionId);

  const handleOpen = async () => {
    setOpen(true);
    setStage('checking');
    setBlockers([]);
    setPreview(null);
    setPostingResult(null);

    try {
      const result = await get(`${accountingBase}/preflight`);
      if (!result.ready) {
        setBlockers(result.blockers);
        setStage('blockers');
        return;
      }

      const receiptPreview = await get(`${accountingBase}/preview`);
      setPreview(receiptPreview);
      setStage('preview');
    } catch {
      setStage('error');
    }
  };

  const handlePost = async () => {
    setStage('posting');
    try {
      const result = await post(`${accountingBase}/post`, {});
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
          {(stage === 'checking' || stage === 'posting') && (
            <Stack alignItems="center" py={3} gap={1}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                {stage === 'checking' ? 'Checking readiness…' : 'Posting to QuickBooks…'}
              </Typography>
            </Stack>
          )}

          {stage === 'blockers' && (
            <Box>
              <Stack direction="row" alignItems="center" gap={1} mb={1}>
                <ErrorOutlineIcon color="error" />
                <Typography fontWeight={600}>Cannot post — blockers must be resolved</Typography>
              </Stack>
              <List dense disablePadding>
                {blockers.map((b) => (
                  <ListItem key={b.code} disableGutters>
                    <ListItemText
                      primary={b.message}
                      secondary={b.code}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption', color: 'text.disabled' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

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
          {stage === 'preview' && (
            <Button variant="contained" color="primary" onClick={handlePost}>
              Confirm &amp; Post
            </Button>
          )}
          {stage === 'blockers' && (
            <Button onClick={handleOpen} variant="outlined">
              Re-check
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
