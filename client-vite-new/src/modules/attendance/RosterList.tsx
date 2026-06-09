import { memo, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import FiberNewRoundedIcon from '@mui/icons-material/FiberNewRounded';
import type { RosterMember } from './types';

type FilterMode = 'all' | 'checked' | 'pending';

interface Props {
  members: RosterMember[];
  isLoading: boolean;
  canSelect?: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  filterMode: FilterMode;
  searchQuery: string;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function getAvatarColor(id: number) {
  const colors = [
    '#1976d2',
    '#388e3c',
    '#f57c00',
    '#7b1fa2',
    '#c62828',
    '#0097a7',
    '#558b2f',
    '#ad1457',
  ];
  return colors[id % colors.length];
}

interface RosterItemProps {
  canSelect: boolean;
  member: RosterMember;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const RosterItem = memo(
  ({ member, isSelected, onToggle, canSelect }: RosterItemProps) => {
    const { id, firstName, lastName, isCheckedIn, isFirstTimer, isChild } =
      member;
    const initials = getInitials(firstName, lastName);
    const avatarBg = getAvatarColor(id);

    return (
      <ListItem
        disablePadding
        divider
        secondaryAction={
          isCheckedIn ? (
            <CheckCircleRoundedIcon color="success" sx={{ fontSize: 28 }} />
          ) : canSelect ? (
            <Checkbox
              edge="end"
              checked={isSelected}
              onChange={() => onToggle(id)}
              icon={<RadioButtonUncheckedRoundedIcon />}
              checkedIcon={<CheckCircleRoundedIcon />}
              color="primary"
              sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
              inputProps={{ 'aria-label': `Select ${firstName} ${lastName}` }}
            />
          ) : null
        }
        sx={{
          bgcolor: isCheckedIn
            ? 'success.50'
            : isSelected
            ? 'primary.50'
            : 'transparent',
          transition: 'background-color 0.15s',
        }}
      >
        <ListItemButton
          onClick={() => !isCheckedIn && canSelect && onToggle(id)}
          disabled={isCheckedIn || !canSelect}
          sx={{
            py: 1.25,
            px: 2,
            minHeight: 64,
            '&.Mui-disabled': { opacity: 1 },
          }}
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                bgcolor: isCheckedIn ? 'success.main' : avatarBg,
                width: 44,
                height: 44,
                fontSize: '0.9rem',
                fontWeight: 600,
                opacity: isCheckedIn ? 0.7 : 1,
              }}
            >
              {initials}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography
                  variant="body1"
                  fontWeight={isSelected ? 600 : 400}
                  sx={{
                    color: isCheckedIn ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {firstName} {lastName}
                </Typography>
                {isFirstTimer && (
                  <Chip
                    label="New"
                    size="small"
                    color="success"
                    icon={<FiberNewRoundedIcon />}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                {isChild && (
                  <Chip
                    label="Child"
                    size="small"
                    color="info"
                    icon={<ChildCareRoundedIcon />}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            }
            secondary={
              isCheckedIn && member.checkedInAt
                ? `Checked in at ${new Date(
                    member.checkedInAt,
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : member.phone ?? undefined
            }
          />
        </ListItemButton>
      </ListItem>
    );
  },
);
RosterItem.displayName = 'RosterItem';

function RosterSkeleton() {
  return (
    <List disablePadding>
      {Array.from({ length: 8 }).map((_, i) => (
        <ListItem key={i} divider sx={{ py: 1.25, px: 2 }}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={44} height={44} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton width={160} />}
            secondary={<Skeleton width={100} />}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default function RosterList({
  members,
  isLoading,
  canSelect = true,
  selectedIds,
  onToggleSelect,
  filterMode,
  searchQuery,
}: Props) {
  const visible = useMemo(() => {
    let list = members;

    if (filterMode === 'checked') list = list.filter((m) => m.isCheckedIn);
    else if (filterMode === 'pending')
      list = list.filter((m) => !m.isCheckedIn);

    // Client-side fuzzy filter (server already filters by search, but this handles
    // the cached/offline case and provides instant feedback as user types)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.phone?.includes(q),
      );
    }

    return list;
  }, [members, filterMode, searchQuery]);

  if (isLoading) return <RosterSkeleton />;

  if (visible.length === 0) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ py: 8, color: 'text.secondary' }}
      >
        <Typography variant="h6">No members found</Typography>
        {searchQuery && (
          <Typography variant="body2">
            Try a different name or clear the search.
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <List disablePadding aria-label="Member roster">
      {visible.map((member) => (
        <RosterItem
          key={member.id}
          canSelect={canSelect}
          member={member}
          isSelected={selectedIds.has(member.id)}
          onToggle={onToggleSelect}
        />
      ))}
    </List>
  );
}
