import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import FiberNewRoundedIcon from '@mui/icons-material/FiberNewRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useQuery } from '@tanstack/react-query';
import { fetchStats } from './api';

interface Props {
  serviceId: number;
}

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}

function StatChip({
  icon,
  label,
  value,
  color = 'text.secondary',
}: StatChipProps) {
  return (
    <Tooltip title={label}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Typography variant="body2" fontWeight={600} sx={{ color }}>
          {value}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', display: { xs: 'none', sm: 'inline' } }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default function StatsWidget({ serviceId }: Props) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['attendance-stats', serviceId],
    queryFn: () => fetchStats(serviceId),
    refetchInterval: 30_000,
    staleTime: 25_000,
  });

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Skeleton width={200} height={40} />
      </Paper>
    );
  }

  if (!stats) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      {/* Total — prominently displayed */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PeopleAltRoundedIcon sx={{ color: 'paper.background' }} />
        <Typography variant="h5" fontWeight={700} color="paper.background">
          {stats.totalCheckedIn}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          checked in
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatChip
          icon={<PersonRoundedIcon fontSize="small" />}
          label="Adults"
          value={stats.adults}
        />
        <StatChip
          icon={<ChildCareRoundedIcon fontSize="small" />}
          label="Children"
          value={stats.children}
          color="info.main"
        />
        <StatChip
          icon={<FiberNewRoundedIcon fontSize="small" />}
          label="First-timers"
          value={stats.firstTimeGuests}
          color="success.main"
        />
      </Box>

      {stats.expectedCount !== undefined && stats.expectedCount > 0 && (
        <>
          <Divider orientation="vertical" flexItem />
          <Typography variant="caption" color="text.secondary">
            {Math.round((stats.totalCheckedIn / stats.expectedCount) * 100)}% of
            expected {stats.expectedCount}
          </Typography>
        </>
      )}
    </Paper>
  );
}
