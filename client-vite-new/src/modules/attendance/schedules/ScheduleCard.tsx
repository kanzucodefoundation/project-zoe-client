import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventRepeatRoundedIcon from '@mui/icons-material/EventRepeatRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateSchedule } from './api';
import type { ServiceSchedule } from './types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SERVICE_TYPE_COLOR: Record<string, 'primary' | 'secondary' | 'warning'> =
  {
    Sunday: 'primary',
    Midweek: 'secondary',
    Special: 'warning',
  };

interface Props {
  canEdit?: boolean;
  schedule: ServiceSchedule;
  onEdit: (s: ServiceSchedule) => void;
}

export default function ScheduleCard({
  schedule,
  onEdit,
  canEdit = true,
}: Props) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      updateSchedule(schedule.id, { isActive }),
    onSuccess: (updated) => {
      queryClient.setQueriesData<ServiceSchedule[]>(
        { queryKey: ['schedules'] },
        (old) => old?.map((s) => (s.id === updated.id ? updated : s)) ?? [],
      );
      toast.success(
        updated.isActive ? 'Schedule activated.' : 'Schedule deactivated.',
      );
    },
    onError: () => toast.error('Failed to update schedule.'),
  });

  const activeDays = schedule.daysOfWeek
    .sort()
    .map((d) => DAYS[d])
    .join(', ');

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        opacity: schedule.isActive ? 1 : 0.6,
        transition: 'opacity 0.2s',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom={false}>
              {schedule.name}
            </Typography>
            {schedule.location && (
              <Typography variant="caption" color="text.secondary">
                {schedule.location.name}
              </Typography>
            )}
          </Box>
          <Chip
            label={schedule.serviceType}
            size="small"
            color={SERVICE_TYPE_COLOR[schedule.serviceType] ?? 'default'}
          />
        </Stack>

        <Stack spacing={0.75} sx={{ mt: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeRoundedIcon
              fontSize="small"
              sx={{ color: 'text.secondary' }}
            />
            <Typography variant="body2">
              {formatTime(schedule.startTime)} &middot;{' '}
              <Box component="span" sx={{ textTransform: 'capitalize' }}>
                {schedule.frequency}
              </Box>
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <EventRepeatRoundedIcon
              fontSize="small"
              sx={{ color: 'text.secondary' }}
            />
            <Typography variant="body2">{activeDays}</Typography>
          </Stack>

          {schedule.metaData?.expectedAttendance && (
            <Stack direction="row" spacing={1} alignItems="center">
              <PeopleRoundedIcon
                fontSize="small"
                sx={{ color: 'text.secondary' }}
              />
              <Typography variant="body2">
                Expected: {schedule.metaData.expectedAttendance}
              </Typography>
            </Stack>
          )}
        </Stack>

        {schedule.tags?.length > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {schedule.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        {(schedule.metaData?.hasChildrensProgram ||
          schedule.metaData?.livestreamEnabled) && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
            {schedule.metaData.hasChildrensProgram && (
              <Chip
                label="Children's program"
                size="small"
                color="info"
                variant="outlined"
              />
            )}
            {schedule.metaData.livestreamEnabled && (
              <Chip
                label="Livestream"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pt: 0 }}>
        {canEdit ? (
          <Tooltip title={schedule.isActive ? 'Deactivate' : 'Activate'}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Switch
                checked={schedule.isActive}
                onChange={(e) => toggleMutation.mutate(e.target.checked)}
                disabled={toggleMutation.isPending}
                color="success"
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                {schedule.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Stack>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {schedule.isActive ? 'Active' : 'Inactive'}
          </Typography>
        )}

        {canEdit ? (
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit(schedule)}
              aria-label="Edit schedule"
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </CardActions>
    </Card>
  );
}
