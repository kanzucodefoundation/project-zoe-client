import {
  List, ListItem, ListItemAvatar, ListItemText,
  Avatar, Typography, Stack, Skeleton, Box,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import WavesIcon from '@mui/icons-material/Waves';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EventIcon from '@mui/icons-material/Event';
import type { SvgIconComponent } from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useContactActivity } from '../tasks/hooks';

dayjs.extend(relativeTime);

interface Props {
  contactId: number;
}

const ACTIVITY_CONFIG: Record<string, { icon: SvgIconComponent; color: string }> = {
  first_visit:           { icon: StarIcon,        color: '#f59e0b' },
  got_saved:             { icon: FavoriteIcon,     color: '#ef4444' },
  task_created:          { icon: AssignmentIcon,   color: '#6b7280' },
  task_assigned:         { icon: PersonIcon,       color: '#6b7280' },
  task_completed:        { icon: CheckCircleIcon,  color: '#22c55e' },
  matched_to_fellowship: { icon: PeopleIcon,       color: '#3b82f6' },
  attended_fellowship:   { icon: GroupIcon,        color: '#8b5cf6' },
  joined_serving_team:   { icon: BuildIcon,        color: '#0ea5e9' },
  got_baptised:          { icon: WavesIcon,        color: '#2e7d32' },
  joined_group:          { icon: GroupAddIcon,     color: '#8b5cf6' },
  attended_event:        { icon: EventIcon,        color: '#f59e0b' },
};

const DEFAULT_CONFIG = { icon: AssignmentIcon, color: '#6b7280' };

export default function ContactActivityFeed({ contactId }: Props) {
  const { data: activities = [], isLoading } = useContactActivity(contactId);

  if (isLoading) {
    return (
      <List>
        {Array.from({ length: 4 }).map((_, i) => (
          <ListItem key={i} alignItems="flex-start">
            <ListItemAvatar>
              <Skeleton variant="circular" width={32} height={32} />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton width="60%" />}
              secondary={<Skeleton width="40%" />}
            />
          </ListItem>
        ))}
      </List>
    );
  }

  if (activities.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="text.secondary">No activity recorded yet</Typography>
      </Box>
    );
  }

  return (
    <List>
      {activities.map((activity) => {
        const config = ACTIVITY_CONFIG[activity.type] ?? DEFAULT_CONFIG;
        const Icon = config.icon;
        return (
          <ListItem key={activity.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar sx={{ width: 32, height: 32, bgcolor: config.color }}>
                <Icon sx={{ fontSize: 18 }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.summary}
              secondary={
                <Stack direction="row" spacing={0.5} component="span">
                  <Typography variant="caption" color="text.secondary" component="span">
                    {dayjs(activity.occurredAt).fromNow()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span">·</Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    {activity.recordedBy?.username ?? 'System'}
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}
