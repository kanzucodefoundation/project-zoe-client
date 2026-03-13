import { Chip } from '@mui/material';
import { TaskStatus, STATUS_LABELS } from '../../utils/types';

interface Props {
  status: TaskStatus;
  size?: 'small' | 'medium';
}

function chipSx(bg: string, fg: string) {
  return { bgcolor: bg, '& .MuiChip-label': { color: fg } };
}

const statusSx: Record<TaskStatus, object> = {
  [TaskStatus.TODO]:                 chipSx('#e0e0e0', '#212121'),
  [TaskStatus.IN_PROGRESS]:          chipSx('#ed6c02', '#fff'),
  [TaskStatus.DONE]:                 chipSx('#9e9e9e', '#fff'),
  [TaskStatus.MATCHED_TO_FELLOWSHIP]:chipSx('#0288d1', '#fff'),
  [TaskStatus.ATTENDED_FELLOWSHIP]:  chipSx('#1976d2', '#fff'),
  [TaskStatus.JOINED_SERVING_TEAM]:  chipSx('#1565c0', '#fff'),
  [TaskStatus.GOT_BAPTISED]:         chipSx('#2e7d32', '#fff'),
};

export default function TaskStatusChip({ status, size = 'small' }: Props) {
  const sx = statusSx[status];
  return (
    <Chip
      label={STATUS_LABELS[status]}
      size={size}
      sx={sx}
    />
  );
}
