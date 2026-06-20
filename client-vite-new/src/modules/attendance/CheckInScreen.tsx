import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchMyLocationGroups,
  fetchRoster,
  fetchTodayServices,
  postCheckIn,
} from './api';
import {
  cacheRoster,
  dequeue,
  enqueue,
  getCachedRoster,
  getQueue,
} from './offlineQueue';
import GuestDialog from './GuestDialog';
import OfflineBanner from './OfflineBanner';
import RosterList from './RosterList';
import StatsWidget from './StatsWidget';
import type { LocationOption, ServiceInstance } from './types';
import type { RootState } from '../../data/store';
import { canEditAttendance } from '../../utils/permissions';

type FilterMode = 'all' | 'checked' | 'pending';

function serviceLabel(s: ServiceInstance): string {
  const name = s.schedule?.name ?? 'Service';
  const time = s.schedule?.startTime;
  return time ? `${name} · ${time}` : name;
}

export default function CheckInScreen() {
  const user = useSelector((state: RootState) => state.core.user);
  const queryClient = useQueryClient();
  const searchRef = useRef<HTMLInputElement>(null);

  const [locationId, setLocationId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [guestOpen, setGuestOpen] = useState(false);
  const canEditAttendanceData = canEditAttendance(user);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSelectedIds(new Set());
        searchRef.current?.blur();
      }
      if (e.key === 'n' && !isInput) {
        if (!canEditAttendanceData) return;
        e.preventDefault();
        setGuestOpen(true);
      }
      if (
        e.key === 'Enter' &&
        !isInput &&
        canEditAttendanceData &&
        selectedIds.size > 0
      ) {
        e.preventDefault();
        handleCheckIn();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEditAttendanceData, selectedIds]);

  // User's location groups
  const { data: locations = [] } = useQuery({
    queryKey: ['my-location-groups'],
    queryFn: fetchMyLocationGroups,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (locations.length === 1) {
      setLocationId(locations[0].id);
    }
  }, [locations]);

  // Reset service selection when location changes
  useEffect(() => {
    setServiceId(null);
    setSelectedIds(new Set());
  }, [locationId]);

  // Today's services for the selected location
  const {
    data: todayServices = [],
    isLoading: loadingServices,
    error: servicesError,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ['today-services', locationId],
    queryFn: () => fetchTodayServices(locationId!),
    enabled: locationId !== null,
  });

  // Auto-select when there is exactly one service
  useEffect(() => {
    if (todayServices.length === 1) {
      setServiceId(todayServices[0].id);
    }
  }, [todayServices]);

  const service = todayServices.find((s) => s.id === serviceId);

  // Roster
  const {
    data: roster = [],
    isLoading: loadingRoster,
    refetch: refetchRoster,
  } = useQuery({
    queryKey: ['roster', serviceId, debouncedQuery],
    queryFn: async () => {
      const data = await fetchRoster(service!.id, debouncedQuery || undefined);
      cacheRoster(service!.id, data);
      return data;
    },
    enabled: service !== undefined,
    placeholderData: service
      ? getCachedRoster(service.id) ?? undefined
      : undefined,
  });

  // Check-in mutation (with optimistic update)
  const checkInMutation = useMutation({
    mutationFn: async ({
      serviceId: sid,
      ids,
    }: {
      serviceId: number;
      ids: number[];
    }) => {
      if (!navigator.onLine) {
        enqueue(sid, { contactIds: ids });
        return;
      }
      await postCheckIn(sid, { contactIds: ids });
    },
    onMutate: async ({ ids }) => {
      await queryClient.cancelQueries({ queryKey: ['roster', serviceId] });

      const previousRoster = queryClient.getQueryData([
        'roster',
        serviceId,
        debouncedQuery,
      ]);

      queryClient.setQueryData(
        ['roster', serviceId, debouncedQuery],
        (old: typeof roster) =>
          old?.map((m) =>
            ids.includes(m.id)
              ? {
                  ...m,
                  isCheckedIn: true,
                  checkedInAt: new Date().toISOString(),
                }
              : m,
          ) ?? [],
      );

      return { previousRoster };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(
        ['roster', serviceId, debouncedQuery],
        ctx?.previousRoster,
      );
      toast.error('Check-in failed. Please try again.');
    },
    onSuccess: (_data, { ids }) => {
      const count = ids.length;
      const offline = !navigator.onLine;
      if (offline) {
        toast.info(
          `${count} check-in${
            count > 1 ? 's' : ''
          } queued — will sync when online.`,
        );
      } else {
        toast.success(`${count} member${count > 1 ? 's' : ''} checked in!`);
        queryClient.invalidateQueries({
          queryKey: ['attendance-stats', serviceId],
        });
      }
    },
    onSettled: () => {
      setSelectedIds(new Set());
    },
  });

  const handleCheckIn = useCallback(() => {
    if (!canEditAttendanceData || !service || selectedIds.size === 0) return;
    checkInMutation.mutate({
      serviceId: service.id,
      ids: Array.from(selectedIds),
    });
  }, [canEditAttendanceData, service, selectedIds, checkInMutation]);

  // Sync offline queue when online
  const syncOfflineQueue = useCallback(async () => {
    if (!canEditAttendanceData || !service) return;
    const queue = getQueue().filter((item) => item.serviceId === service.id);
    for (const item of queue) {
      try {
        await postCheckIn(item.serviceId, item.payload);
        dequeue(item.id);
      } catch {
        // Will retry next sync
      }
    }
    refetchRoster();
    queryClient.invalidateQueries({
      queryKey: ['attendance-stats', service.id],
    });
  }, [canEditAttendanceData, service, refetchRoster, queryClient]);

  const handleToggleSelect = useCallback(
    (id: number) => {
      if (!canEditAttendanceData) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [canEditAttendanceData],
  );

  // --- Render ---

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Stack spacing={2}>
        {/* Offline banner */}
        <OfflineBanner
          onSync={canEditAttendanceData ? syncOfflineQueue : undefined}
        />

        {!canEditAttendanceData ? (
          <Alert severity="info">
            Attendance is in read-only mode for your account.
          </Alert>
        ) : null}

        <Typography variant="h4" gutterBottom>
          Check-In
        </Typography>

        {/* Location selector — only shown when user belongs to multiple location groups */}
        {locations.length > 1 ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Select location to begin
              </Typography>
              <Autocomplete<LocationOption>
                options={locations}
                getOptionLabel={(o) => o.name}
                value={locations.find((l) => l.id === locationId) ?? null}
                onChange={(_, option) => {
                  if (option) setLocationId(option.id);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Location"
                    size="medium"
                    placeholder="Search locations…"
                  />
                )}
                sx={{ maxWidth: 400 }}
              />
            </Stack>
          </Paper>
        ) : null}

        {/* Services loading/error */}
        {locationId && loadingServices && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading today&apos;s services…
            </Typography>
          </Box>
        )}

        {locationId && servicesError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => refetchServices()}>
                Retry
              </Button>
            }
          >
            Could not load today&apos;s services.
          </Alert>
        )}

        {/* Service selector — only shown when multiple services exist today */}
        {todayServices.length > 1 ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Select service
              </Typography>
              <Autocomplete<ServiceInstance>
                options={todayServices}
                getOptionLabel={serviceLabel}
                value={service ?? null}
                onChange={(_, option) => {
                  setServiceId(option ? option.id : null);
                  setSelectedIds(new Set());
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Service"
                    size="medium"
                    placeholder="Choose a service…"
                  />
                )}
                sx={{ maxWidth: 400 }}
              />
            </Stack>
          </Paper>
        ) : null}

        {/* Main check-in area */}
        {service && (
          <>
            {/* Service header */}
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {service.schedule?.name ?? 'Service'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {service.serviceDate
                  ? new Date(
                      `${service.serviceDate}T00:00:00`,
                    ).toLocaleDateString([], {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}
                {service.schedule?.startTime
                  ? ` · ${service.schedule.startTime}`
                  : ''}
              </Typography>
            </Box>

            {/* Stats */}
            <StatsWidget serviceId={service.id} />

            {/* Toolbar: search + actions */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <TextField
                inputRef={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members…"
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <Box
                        component="button"
                        onClick={() => setSearchQuery('')}
                        sx={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          p: 0,
                          color: 'text.secondary',
                        }}
                        aria-label="Clear search"
                      >
                        <ClearRoundedIcon fontSize="small" />
                      </Box>
                    </InputAdornment>
                  ) : null,
                }}
                inputProps={{ 'aria-label': 'Search members' }}
              />

              {canEditAttendanceData ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddRoundedIcon />}
                  onClick={() => setGuestOpen(true)}
                  sx={{ minHeight: 40, whiteSpace: 'nowrap' }}
                  aria-label="Add guest (press n)"
                >
                  Guest
                </Button>
              ) : null}
            </Stack>

            {/* Filter tabs */}
            <Tabs
              value={filterMode}
              onChange={(_, v) => setFilterMode(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                label={`All (${roster.length})`}
                value="all"
                sx={{ minHeight: 44 }}
              />
              <Tab
                label={`Checked In (${
                  roster.filter((m) => m.isCheckedIn).length
                })`}
                value="checked"
                sx={{ minHeight: 44 }}
              />
              <Tab
                label={`Pending (${
                  roster.filter((m) => !m.isCheckedIn).length
                })`}
                value="pending"
                sx={{ minHeight: 44 }}
              />
            </Tabs>

            {/* Roster */}
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: '60vh',
                overflowY: 'auto',
              }}
            >
              <RosterList
                members={roster}
                isLoading={loadingRoster}
                canSelect={canEditAttendanceData}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                filterMode={filterMode}
                searchQuery={searchQuery}
              />
            </Paper>
          </>
        )}
      </Stack>

      {/* Floating check-in button (shows when members are selected) */}
      {service && canEditAttendanceData && selectedIds.size > 0 && (
        <Fab
          variant="extended"
          color="primary"
          onClick={handleCheckIn}
          disabled={checkInMutation.isPending}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            minHeight: 56,
            px: 3,
            zIndex: 1200,
            boxShadow: 6,
          }}
          aria-label={`Check in ${selectedIds.size} member${
            selectedIds.size > 1 ? 's' : ''
          }`}
        >
          {checkInMutation.isPending ? (
            <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
          ) : (
            <CheckRoundedIcon sx={{ mr: 1 }} />
          )}
          <Badge badgeContent={selectedIds.size} color="error" sx={{ mr: 1 }}>
            <Typography variant="button" sx={{ lineHeight: 1 }}>
              Check In
            </Typography>
          </Badge>
        </Fab>
      )}

      {/* Guest dialog */}
      {service && canEditAttendanceData && (
        <GuestDialog
          open={guestOpen}
          serviceId={service.id}
          onClose={() => setGuestOpen(false)}
        />
      )}
    </Container>
  );
}
