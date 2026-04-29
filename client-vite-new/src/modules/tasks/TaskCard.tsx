import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import TaskStatusChip from './TaskStatusChip';
import TaskTypeChip from './TaskTypeChip';
import { localRoutes } from '../../data/constants';
import type { Task, TaskUser } from '../../utils/types';
import { TYPE_LABELS } from '../../utils/types';
import { Diversity1, SafetyDividerOutlined } from '@mui/icons-material';

interface Props {
  task: Task;
  onOpen: (task: Task) => void;
  showContact?: boolean;
}

function getInitials(user: TaskUser | undefined) {
  const person = user?.contact?.person;
  if (!person) return '?';
  return `${person.firstName[0] ?? ''}${
    person.lastName[0] ?? ''
  }`.toUpperCase();
}

function getFullName(user: TaskUser | undefined) {
  const person = user?.contact?.person;
  if (!person) return 'Unknown';
  return `${person.firstName} ${person.lastName}`.trim();
}

export default function TaskCard({ task, onOpen, showContact = false }: Props) {
  const contactName = task.contact?.person
    ? `${task.contact.person.firstName} ${task.contact.person.lastName}`.trim()
    : 'Unknown';

  return (
    <Card
      onClick={() => onOpen(task)}
      sx={{ cursor: 'pointer', mb: 1, '&:hover': { boxShadow: 4 } }}
      elevation={2}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <TaskTypeChip type={task.type} />
          <TaskStatusChip status={task.status} />
          {task.dueAt && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 'auto' }}
            >
              Due {dayjs(task.dueAt).format('DD MMM YYYY')}
            </Typography>
          )}
        </Stack>

        {showContact && task.contact && (
          <Typography
            variant="body2"
            component={Link}
            to={`${localRoutes.contacts}/${task.contact.id}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              display: 'block',
              mb: 0.5,
            }}
          >
            {contactName}
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />

        <Typography variant="body1" fontWeight={500} mb={0.5}>
          {task.title || TYPE_LABELS[task.type]}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          {task.assignedTo ? (
            <>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.65rem',
                  bgcolor: 'primary.light',
                }}
              >
                {getInitials(task.assignedTo)}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {getFullName(task.assignedTo)}
              </Typography>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Unassigned
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
