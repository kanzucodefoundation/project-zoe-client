import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import { semantic } from '../../theme-wh/tokens';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { NotificationType } from '../../utils/types';

type Meta = {
  Icon: typeof NotificationsRoundedIcon;
  color: string;
  tint: string;
  darkColor: string;
  label: string;
};

const META: Record<string, Meta> = {
  [NotificationType.TASK_ASSIGNED]: {
    Icon: AssignmentIndRoundedIcon,
    color: 'primary.main',
    darkColor: semantic.dark.brandText,
    tint: 'primary.light',
    label: 'Task assigned',
  },
  [NotificationType.TASK_REASSIGNED]: {
    Icon: SwapHorizRoundedIcon,
    color: 'info.main',
    darkColor: semantic.dark.info,
    tint: 'info.light',
    label: 'Task reassigned',
  },
  [NotificationType.TASK_DUE]: {
    Icon: ScheduleRoundedIcon,
    color: 'warning.main',
    darkColor: semantic.dark.warning,
    tint: 'warning.light',
    label: 'Task due',
  },
  [NotificationType.REPORT_SUBMITTED]: {
    Icon: AssignmentTurnedInRoundedIcon,
    color: 'success.main',
    darkColor: semantic.dark.success,
    tint: 'success.light',
    label: 'Report submitted',
  },
  [NotificationType.SCHEDULE_CHANGED]: {
    Icon: EventRepeatRoundedIcon,
    color: 'info.main',
    darkColor: semantic.dark.info,
    tint: 'info.light',
    label: 'Schedule changed',
  },
};

const FALLBACK: Meta = {
  Icon: NotificationsRoundedIcon,
  color: 'text.secondary',
  tint: 'action.hover',
  darkColor: semantic.dark.textSecondary,
  label: 'Notification',
};

const notificationMeta = (type: string): Meta => META[type] ?? FALLBACK;

interface NotificationAvatarProps {
  type: string;
  size?: number;
}

export default function NotificationAvatar({
  type,
  size = 40,
}: NotificationAvatarProps) {
  const { Icon, color, tint, darkColor, label } = notificationMeta(type);

  return (
    <Avatar
      variant="rounded"
      aria-label={label}
      sx={(theme) => ({
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: tint,
        color,
        ...theme.applyStyles('dark', {
          bgcolor: alpha('#FFFFFF', 0.08),
          color: darkColor,
        }),
      })}
    >
      <Icon sx={{ fontSize: size * 0.5 }} />
    </Avatar>
  );
}
