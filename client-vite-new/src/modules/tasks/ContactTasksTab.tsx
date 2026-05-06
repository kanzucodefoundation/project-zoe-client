import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import { useContactTasks } from './hooks';
import TaskCard from './TaskCard';
import TaskDrawer from './TaskDrawer';
import CreateTaskDialog from './CreateTaskDialog';
import type { Task } from '../../utils/types';
import type { RootState } from '../../data/store';
import { canEditTasks, canViewTasks } from '../../utils/permissions';

interface Props {
  contactId: number;
}

export default function ContactTasksTab({ contactId }: Props) {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.core.user);
  const { data: tasks = [], isLoading } = useContactTasks(contactId);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const canViewTaskData = canViewTasks(user);
  const canEditTaskData = canEditTasks(user);

  if (!canViewTaskData) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="text.secondary">
          You do not have permission to view tasks.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {canEditTaskData ? (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            fullWidth={isPhone}
          >
            New Task
          </Button>
        </Box>
      ) : null}

      {tasks.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">No tasks yet</Typography>
        </Box>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={setSelectedTask}
            showContact={false}
          />
        ))
      )}

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={(updated) => setSelectedTask(updated)}
        contactId={contactId}
      />

      {canEditTaskData ? (
        <CreateTaskDialog
          open={createOpen}
          contactId={contactId}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => setCreateOpen(false)}
        />
      ) : null}
    </Box>
  );
}
