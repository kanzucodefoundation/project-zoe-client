import { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useContactTasks } from './hooks';
import TaskCard from './TaskCard';
import TaskDrawer from './TaskDrawer';
import CreateTaskDialog from './CreateTaskDialog';
import type { Task } from '../../utils/types';

interface Props {
  contactId: number;
}

export default function ContactTasksTab({ contactId }: Props) {
  const { data: tasks = [], isLoading } = useContactTasks(contactId);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          New Task
        </Button>
      </Box>

      {tasks.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">No tasks yet</Typography>
        </Box>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={setSelectedTask} showContact={false} />
        ))
      )}

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={(updated) => setSelectedTask(updated)}
        contactId={contactId}
      />

      <CreateTaskDialog
        open={createOpen}
        contactId={contactId}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setCreateOpen(false)}
      />
    </Box>
  );
}
