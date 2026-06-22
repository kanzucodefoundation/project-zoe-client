import { Chip } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PeopleIcon from '@mui/icons-material/People';
import RepeatIcon from '@mui/icons-material/Repeat';
import { TaskType, TYPE_LABELS } from '../../utils/types';
import type { SvgIconComponent } from '@mui/icons-material';

interface Props {
  type: TaskType;
  size?: 'small' | 'medium';
}

const TYPE_ICONS: Record<TaskType, SvgIconComponent> = {
  [TaskType.CALL]: PhoneIcon,
  [TaskType.VISIT]: DirectionsWalkIcon,
  [TaskType.MATCH]: PeopleIcon,
  [TaskType.FOLLOW_UP]: RepeatIcon,
};

export default function TaskTypeChip({ type, size = 'small' }: Props) {
  const Icon = TYPE_ICONS[type];
  return (
    <Chip
      icon={<Icon />}
      label={TYPE_LABELS[type]}
      size={size}
      variant="outlined"
    />
  );
}
