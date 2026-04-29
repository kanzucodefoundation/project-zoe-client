import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { useAllTasks } from './hooks';
import TaskCard from './TaskCard';
import TaskDrawer from './TaskDrawer';
import { TaskStatus, STATUS_LABELS, type Task } from '../../utils/types';

const ALL_STATUSES = Object.values(TaskStatus) as TaskStatus[];

export default function MyTasks() {
  const user = useSelector((state: RootState) => state.core.user);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const userId = user?.id ? Number(user.id) : undefined;
  const hasStatusFilter = selectedStatuses.length > 0;

  const { data, isLoading } = useAllTasks({
    assignedToId: userId,
    status: hasStatusFilter ? selectedStatuses : undefined,
    limit: 100,
  });

  const tasks = data?.data ?? [];

  const toggleStatus = (s: TaskStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  // Group tasks by status
  const grouped = ALL_STATUSES.reduce<Record<string, Task[]>>((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});
  const visibleStatuses = hasStatusFilter
    ? selectedStatuses
    : ALL_STATUSES.filter((s) => (grouped[s] ?? []).length > 0);

  return (
    <Container maxWidth="md">
      <Box mb={3}>
        <Typography variant="h4">My Tasks</Typography>
      </Box>

      <Stack direction="row" flexWrap="wrap" spacing={1} mb={3}>
        {ALL_STATUSES.map((s) => (
          <Chip
            key={s}
            label={STATUS_LABELS[s]}
            size="small"
            color={selectedStatuses.includes(s) ? 'primary' : 'default'}
            variant={selectedStatuses.includes(s) ? 'filled' : 'outlined'}
            onClick={() => toggleStatus(s)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        visibleStatuses.map((s) => {
          const group = grouped[s] ?? [];
          if (group.length === 0) return null;
          return (
            <Box key={s} mb={3}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {STATUS_LABELS[s]}
              </Typography>
              {group.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onOpen={setSelectedTask}
                  showContact
                />
              ))}
            </Box>
          );
        })
      )}

      {!isLoading && tasks.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            {hasStatusFilter
              ? 'No tasks match the selected statuses'
              : 'No tasks assigned to you'}
          </Typography>
        </Box>
      )}

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={(updated) => setSelectedTask(updated)}
        contactId={selectedTask?.contactId}
      />
    </Container>
  );
}
