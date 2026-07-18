import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import FiberNewRoundedIcon from '@mui/icons-material/FiberNewRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import { fetchAllLocationGroups } from '../api';
import { fetchSchedules } from '../schedules/api';
import type { ServiceInstance } from '../types';
import type { ServiceSchedule } from '../schedules/types';

interface Attendee {
  id: number;
  contactId: number;
  firstName: string;
  lastName: string;
  checkedInAt: string;
  isFirstTime: boolean;
  isChild: boolean;
}

const fetchInstances = async (
  scheduleId?: number,
  locationId?: number,
): Promise<ServiceInstance[]> => {
  const params: Record<string, any> = {};
  if (scheduleId) params.scheduleId = scheduleId;
  if (locationId) params.locationId = locationId;
  const res = await api.get(`${remoteRoutes.services}/instances`, { params });
  return res.data;
};

const fetchAttendees = async (serviceId: number): Promise<Attendee[]> => {
  const res = await api.get(`${remoteRoutes.services}/${serviceId}/attendees`);
  return res.data;
};

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Attendee list for a single instance ---
function AttendeeList({ serviceId }: { serviceId: number }) {
  const {
    data: attendees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['attendees', serviceId],
    queryFn: () => fetchAttendees(serviceId),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <Box sx={{ px: 2, py: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Stack
            key={i}
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ py: 0.75 }}
          >
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton width={160} />
          </Stack>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 2, py: 1 }}>
        <Alert severity="error" sx={{ fontSize: '0.8rem' }}>
          Failed to load attendees.
        </Alert>
      </Box>
    );
  }

  if (attendees.length === 0) {
    return (
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No check-ins recorded.
        </Typography>
      </Box>
    );
  }

  return (
    <List dense disablePadding>
      {attendees.map((a, idx) => (
        <ListItem
          key={a.id}
          divider={idx < attendees.length - 1}
          sx={{ px: 3, py: 0.75 }}
        >
          <ListItemAvatar sx={{ minWidth: 44 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                bgcolor: 'primary.light',
              }}
            >
              {getInitials(a.firstName, a.lastName)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="body2">
                  {a.firstName} {a.lastName}
                </Typography>
                {a.isFirstTime && (
                  <Chip
                    label="New"
                    size="small"
                    color="success"
                    icon={<FiberNewRoundedIcon />}
                    sx={{ height: 18, fontSize: '0.6rem' }}
                  />
                )}
                {a.isChild && (
                  <Chip
                    label="Child"
                    size="small"
                    color="info"
                    icon={<ChildCareRoundedIcon />}
                    sx={{ height: 18, fontSize: '0.6rem' }}
                  />
                )}
              </Box>
            }
            secondary={`Checked in at ${formatTime(a.checkedInAt)}`}
          />
        </ListItem>
      ))}
    </List>
  );
}

// --- Single instance row ---
function InstanceRow({ instance }: { instance: ServiceInstance }) {
  const [expanded, setExpanded] = useState(false);
  const name = instance.schedule?.name ?? 'Service';
  const location = instance.schedule?.location?.name;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Header row */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <EventNoteRoundedIcon color="action" />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {formatDate(instance.serviceDate)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {name}
              {location ? ` · ${location}` : ''}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PeopleRoundedIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={600} color="primary">
              {instance.cachedTotalCount}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </IconButton>
        </Stack>
      </Stack>

      {/* Attendee list */}
      <Collapse in={expanded} unmountOnExit>
        <Divider />
        <AttendeeList serviceId={instance.id} />
      </Collapse>
    </Paper>
  );
}

// --- Main page ---
export default function AttendanceHistory() {
  const [filterLocationId, setFilterLocationId] = useState<number | null>(null);
  const [filterSchedule, setFilterSchedule] = useState<ServiceSchedule | null>(
    null,
  );

  const { data: locations = [] } = useQuery({
    queryKey: ['all-location-groups'],
    queryFn: fetchAllLocationGroups,
    staleTime: 5 * 60_000,
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules', filterLocationId],
    queryFn: () => fetchSchedules(filterLocationId ?? undefined),
    staleTime: 60_000,
  });

  const {
    data: instances = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['instances', filterSchedule?.id, filterLocationId],
    queryFn: () =>
      fetchInstances(
        filterSchedule?.id,
        !filterSchedule ? filterLocationId ?? undefined : undefined,
      ),
    staleTime: 60_000,
  });

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Attendance History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse past services and see who attended.
          </Typography>
        </Box>

        {/* Filters */}
        <Stack direction="row" flexWrap="wrap" display="flex" alignItems="center" gap={2}>
          <Autocomplete
            options={locations}
            getOptionLabel={(o) => o.name}
            value={locations.find((l) => l.id === filterLocationId) ?? null}
            onChange={(_, opt) => {
              setFilterLocationId(opt?.id ?? null);
              setFilterSchedule(null);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Location" size="small" />
            )}
            sx={{ minWidth: 220 }}
          />

          <Autocomplete
            options={schedules}
            getOptionLabel={(s) => s.name}
            value={filterSchedule}
            onChange={(_, opt) => setFilterSchedule(opt)}
            renderInput={(params) => (
              <TextField {...params} label="Schedule" size="small" />
            )}
            sx={{ minWidth: 220 }}
            disabled={schedules.length === 0}
          />
        </Stack>

        {/* Content */}
        {isLoading && (
          <Stack spacing={1.5}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={64} />
            ))}
          </Stack>
        )}

        {error && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load attendance history.
          </Alert>
        )}

        {!isLoading && !error && instances.length === 0 && (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No services found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }} textAlign="center">
              {filterLocationId || filterSchedule
                ? 'Try clearing the filters.'
                : 'Check-in data will appear here after services run.'}
            </Typography>
          </Stack>
        )}

        {!isLoading && instances.length > 0 && (
          <Stack spacing={1.5}>
            {instances.map((instance) => (
              <InstanceRow key={instance.id} instance={instance} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
