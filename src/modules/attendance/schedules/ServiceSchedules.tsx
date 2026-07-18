import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchAllLocationGroups } from '../api';
import { fetchSchedules } from './api';
import ScheduleCard from './ScheduleCard';
import ScheduleFormDialog from './ScheduleFormDialog';
import type { ServiceSchedule, ServiceType } from './types';
import type { RootState } from '../../../data/store';
import { canEditAttendance } from '../../../utils/permissions';

function SchedulesSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function ServiceSchedules() {
  const user = useSelector((state: RootState) => state.core.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceSchedule | null>(null);
  const [filterLocationId, setFilterLocationId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<ServiceType | 'all'>('all');
  const canEditAttendanceData = canEditAttendance(user);

  const { data: locations = [] } = useQuery({
    queryKey: ['all-location-groups'],
    queryFn: fetchAllLocationGroups,
    staleTime: 5 * 60_000,
  });

  const {
    data: schedules = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['schedules', filterLocationId],
    queryFn: () => fetchSchedules(filterLocationId ?? undefined),
    staleTime: 60_000,
  });

  const visible =
    filterType === 'all'
      ? schedules
      : schedules.filter((s) => s.serviceType === filterType);

  const handleEdit = (schedule: ServiceSchedule) => {
    if (!canEditAttendanceData) return;
    setEditing(schedule);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    if (!canEditAttendanceData) return;
    setEditing(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Service Schedules
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage recurring services. Today's attendance instances are
              auto-created from active schedules.
            </Typography>
          </Box>
          {canEditAttendanceData ? (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleAdd}
              sx={{ minHeight: 44 }}
            >
              Add Schedule
            </Button>
          ) : null}
        </Stack>

        {!canEditAttendanceData ? (
          <Alert severity="info">
            Schedules are visible, but editing is disabled for your account.
          </Alert>
        ) : null}

        {/* Filters */}
        <Stack direction="row" flexWrap="wrap" display="flex" alignItems="center" gap={2}>
          <Autocomplete
            options={locations}
            getOptionLabel={(o) => o.name}
            value={locations.find((l) => l.id === filterLocationId) ?? null}
            onChange={(_, opt) => setFilterLocationId(opt?.id ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Filter by location" size="small" />
            )}
            sx={{ minWidth: 220 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Service type</InputLabel>
            <Select
              label="Service type"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as ServiceType | 'all')
              }
            >
              <MenuItem value="all">All types</MenuItem>
              <MenuItem value="Sunday">Sunday</MenuItem>
              <MenuItem value="Midweek">Midweek</MenuItem>
              <MenuItem value="Special">Special</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Content */}
        {isLoading && <SchedulesSkeleton />}

        {error && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load schedules.
          </Alert>
        )}

        {!isLoading && !error && visible.length === 0 && (
          <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No schedules found
            </Typography>
            <Typography variant="body2" color="text.disabled" textAlign="center">
              {filterLocationId || filterType !== 'all'
                ? 'Try clearing the filters.'
                : 'Create your first service schedule to get started.'}
            </Typography>
            {canEditAttendanceData &&
              !filterLocationId &&
              filterType === 'all' && (
                <Button
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleAdd}
                >
                  Add Schedule
                </Button>
              )}
          </Stack>
        )}

        {!isLoading && visible.length > 0 && (
          <Grid container spacing={2}>
            {visible.map((schedule) => (
              <Grid key={schedule.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <ScheduleCard
                  schedule={schedule}
                  onEdit={handleEdit}
                  canEdit={canEditAttendanceData}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {canEditAttendanceData ? (
        <ScheduleFormDialog
          open={dialogOpen}
          onClose={handleClose}
          editing={editing}
        />
      ) : null}
    </Container>
  );
}
