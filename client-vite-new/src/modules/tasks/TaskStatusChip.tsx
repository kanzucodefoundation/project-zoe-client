import { Chip } from '@mui/material';
import { TaskStatus, STATUS_LABELS } from '../../utils/types';

interface Props {
  status: TaskStatus;
  size?: 'small' | 'medium';
}

const statusSx: Record<TaskStatus, object> = {
  [TaskStatus.TODO]: {},
  [TaskStatus.IN_PROGRESS]: { bgcolor: 'warning.main', color: 'warning.contrastText' },
  [TaskStatus.DONE]: { bgcolor: 'grey.400' },
  [TaskStatus.MATCHED_TO_FELLOWSHIP]: { bgcolor: 'info.main', color: 'info.contrastText' },
  [TaskStatus.ATTENDED_FELLOWSHIP]: { bgcolor: 'primary.main', color: 'primary.contrastText' },
  [TaskStatus.JOINED_SERVING_TEAM]: { bgcolor: 'primary.dark', color: 'primary.contrastText' },
  [TaskStatus.GOT_BAPTISED]: { bgcolor: '#2e7d32', color: '#fff' },
};

export default function TaskStatusChip({ status, size = 'small' }: Props) {
  const sx = statusSx[status];
  const isDefault = status === TaskStatus.TODO;
  return (
    <Chip
      label={STATUS_LABELS[status]}
      size={size}
      color={isDefault ? 'default' : undefined}
      sx={isDefault ? undefined : sx}
    />
  );
}
