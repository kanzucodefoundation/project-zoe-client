import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Divider,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import TaskStatusChip from './TaskStatusChip';
import TaskTypeChip from './TaskTypeChip';
import { localRoutes } from '../../data/constants';
import type { Task, TaskUser } from '../../utils/types';
import { TYPE_LABELS, TaskStatus } from '../../utils/types';

interface Props {
  task: Task;
  onOpen: (task: Task) => void;
  showContact?: boolean;
}

function getInitials(user: TaskUser | undefined) {
  const person = user?.contact?.person;
  if (!person) return user?.username?.[0]?.toUpperCase() ?? '?';
  return `${person.firstName[0] ?? ''}${
    person.lastName[0] ?? ''
  }`.toUpperCase();
}

function getFullName(user: TaskUser | undefined) {
  const person = user?.contact?.person;
  if (!person) return user?.username ?? 'Unknown';
  return `${person.firstName} ${person.lastName}`.trim();
}

export default function TaskCard({ task, onOpen, showContact = false }: Props) {
  const contactName = task.contact?.person
    ? `${task.contact.person.firstName} ${task.contact.person.lastName}`.trim()
    : 'Unknown';

  return (
    <Card
      onClick={() => onOpen(task)}
      sx={{
        cursor: 'pointer',
        mb: { xs: 1.5, sm: 1 },
        borderRadius: 2,
        transition: 'box-shadow 160ms ease, transform 160ms ease',
        '&:hover': { boxShadow: 4 },
        '&:active': { transform: 'scale(0.995)' },
        ...(task.status === TaskStatus.DONE && {
          bgcolor: '#e8f5e9',
          borderLeft: '4px solid #2e7d32',
        }),
        ...(task.status !== TaskStatus.DONE &&
          task.dueAt &&
          dayjs(task.dueAt).isBefore(dayjs()) && {
            bgcolor: '#ffebee',
            borderLeft: '4px solid #c62828',
          }),
        ...(task.status !== TaskStatus.DONE &&
          task.dueAt &&
          dayjs(task.dueAt).isAfter(dayjs()) &&
          dayjs(task.dueAt).isBefore(dayjs().add(1, 'day')) && {
            bgcolor: '#fff8e1',
            borderLeft: '4px solid #f57f17',
          }),
      }}
      elevation={2}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          '&:last-child': { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
          mb={1.5}
        >
          <Box>
            <TaskTypeChip type={task.type} />
          </Box>
          <Box>
            <TaskStatusChip status={task.status} />
          </Box>
          {task.dueAt && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                ml: { sm: 'auto' },
                width: { xs: '100%', sm: 'auto' },
                fontWeight: 600,
              }}
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
              fontWeight: 700,
            }}
          >
            {contactName}
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />

        <Typography variant="body1" fontWeight={500} mb={0.5}>
          {task.title || TYPE_LABELS[task.type]}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ minWidth: 0 }}
        >
          <Typography variant="caption" color="text.secondary">
            Assigned to
          </Typography>
          {task.assignedTo ? (
            <>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.65rem',
                  bgcolor: 'primary.paper',
                }}
              >
                {getInitials(task.assignedTo)}
              </Avatar>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
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
