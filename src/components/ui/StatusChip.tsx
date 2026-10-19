import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONE_SX: Record<StatusTone, ChipProps['sx']> = {
  neutral: { bgcolor: 'action.hover', color: 'text.secondary' },
  success: { bgcolor: 'success.light', color: 'success.main', '& .MuiChip-label': { color: 'text.primary' } },
  warning: { bgcolor: 'warning.light', color: 'warning.main', '& .MuiChip-label': { color: 'text.primary' } },
  danger: { bgcolor: 'error.light', color: 'error.main', '& .MuiChip-label': { color: 'text.primary' } },
  info: { bgcolor: 'info.light', color: 'info.main', '& .MuiChip-label': { color: 'text.primary' } },
};

const STATUS_MAP: Record<string, { tone: StatusTone; label: string }> = {
  ACTIVE: { tone: 'success', label: 'Active' },
  INACTIVE: { tone: 'neutral', label: 'Inactive' },
  PENDING: { tone: 'warning', label: 'Pending' },
  PENDING_APPROVAL: { tone: 'warning', label: 'Awaiting approval' },
  DRAFT: { tone: 'neutral', label: 'Draft' },
  APPROVED: { tone: 'info', label: 'Approved' },
  MATCHED: { tone: 'info', label: 'Matched' },
  UNMATCHED: { tone: 'neutral', label: 'Unmatched' },
  POSTED: { tone: 'success', label: 'Posted' },
  RECONCILED: { tone: 'success', label: 'Reconciled' },
  EXECUTED: { tone: 'success', label: 'Executed' },
  FAILED: { tone: 'danger', label: 'Failed' },
  SKIPPED: { tone: 'neutral', label: 'Skipped' },
};

export interface StatusChipProps {
  status: string;
  label?: string;
  size?: ChipProps['size'];
}

export default function StatusChip({
  status,
  label,
  size = 'small',
}: StatusChipProps) {
  const mapped = status ? STATUS_MAP[status.toUpperCase()] : undefined;
  const tone = mapped?.tone ?? 'neutral';
  // An unmapped status still renders readably rather than crashing the row.
  const text =
    label ??
    mapped?.label ??
    (status ?? '')
      .replace(/[_-]/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());

  return <Chip size={size} label={text} sx={TONE_SX[tone]} />;
}
