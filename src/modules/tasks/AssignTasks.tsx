import { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useLocationScopedTasks } from './hooks';
import TaskStatusChip from './TaskStatusChip';
import AssignTaskDialog from './AssignTaskDialog';
import { CLOSED_STATUSES, TYPE_LABELS, type Task } from '../../utils/types';

dayjs.extend(isBetween);

type DateRange = 'today' | 'this_week' | 'this_month' | 'last_3_months' | 'all';

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  last_3_months: 'Last 3 Months',
  all: 'All Time',
};

function getDateBounds(range: DateRange): {
  from: dayjs.Dayjs | null;
  to: dayjs.Dayjs | null;
} {
  const now = dayjs();
  switch (range) {
    case 'today':
      return { from: now.startOf('day'), to: now.endOf('day') };
    case 'this_week': {
      const startOfWeek = now.day(0).startOf('day');
      return { from: startOfWeek, to: startOfWeek.add(6, 'day').endOf('day') };
    }
    case 'this_month':
      return { from: now.startOf('month'), to: now.endOf('month') };
    case 'last_3_months':
      return {
        from: now.subtract(3, 'month').startOf('day'),
        to: now.endOf('day'),
      };
    default:
      return { from: null, to: null };
  }
}

function isOverdue(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return dayjs(dueAt).isBefore(dayjs(), 'day');
}

function getAssigneeName(task: Task): string | null {
  const u = task.assignedTo;
  if (!u) return null;
  const p = u.contact?.person;
  return p ? `${p.firstName} ${p.lastName}` : u.username;
}

function getLatestComment(task: Task): { body: string; author: string } | null {
  const c = task.latestComment;
  if (!c) return null;
  const p = c.author?.contact?.person;
  const author = p ? `${p.firstName} ${p.lastName}` : c.author?.username ?? '';
  return { body: c.body, author };
}

export default function AssignTasks() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dateRange, setDateRange] = useState<DateRange>('this_week');
  const [dialogTask, setDialogTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const { data, isLoading } = useLocationScopedTasks({ limit: 200 });

  const allTasks = useMemo(() => data?.data ?? [], [data]);

  const filteredTasks = useMemo(() => {
    const { from, to } = getDateBounds(dateRange);
    if (!from || !to) return allTasks;
    return allTasks.filter((t) => {
      if (!t.createdAt) return false;
      return dayjs(t.createdAt).isBetween(from, to, 'day', '[]');
    });
  }, [allTasks, dateRange]);

  const handleAssigned = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const displayTasks =
    tasks.length > 0
      ? filteredTasks.map((t) => tasks.find((u) => u.id === t.id) ?? t)
      : filteredTasks;

  return (
    <Container
      maxWidth="lg"
      disableGutters={isMobile}
      sx={{ px: { xs: 0, sm: 2 } }}
    >
      {/* Page header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        spacing={1.5}
        mb={{ xs: 2, sm: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Assign Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage and assign tasks to your team members.
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="date-range-label">Date Range</InputLabel>
          <Select
            labelId="date-range-label"
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            startAdornment={
              <CalendarTodayIcon
                fontSize="small"
                sx={{ mr: 0.75, color: 'text.secondary' }}
              />
            }
          >
            {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((key) => (
              <MenuItem key={key} value={key}>
                {DATE_RANGE_LABELS[key]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <MobileTaskList tasks={displayTasks} onAssign={setDialogTask} />
      ) : (
        <DesktopTable tasks={displayTasks} onAssign={setDialogTask} />
      )}

      {!isLoading && displayTasks.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            No tasks found for the selected date range.
          </Typography>
        </Box>
      )}

      <AssignTaskDialog
        task={dialogTask}
        open={Boolean(dialogTask)}
        onClose={() => setDialogTask(null)}
        onAssigned={handleAssigned}
      />
    </Container>
  );
}

/* ── Desktop table ──────────────────────────────────────────────────────────── */

function DesktopTable({
  tasks,
  onAssign,
}: {
  tasks: Task[];
  onAssign: (t: Task) => void;
}) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 2, overflowX: 'auto' }}
    >
      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow
            sx={(theme) => ({
              bgcolor: 'background.paper',
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <TableCell sx={{ fontWeight: 600, width: '25%' }}>
              Task Name
            </TableCell>
            <TableCell sx={{ fontWeight: 600, width: '15%' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, width: '13%' }}>
              Due Date
            </TableCell>
            <TableCell sx={{ fontWeight: 600, width: '15%' }}>
              Address
            </TableCell>
            <TableCell sx={{ fontWeight: 600, width: '15%' }}>
              Assigned To
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Comment</TableCell>
            <TableCell
              sx={{ fontWeight: 600, width: '90px', textAlign: 'right' }}
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueAt);
            const closed = CLOSED_STATUSES.includes(task.status);
            const comment = getLatestComment(task);
            const assignee = getAssigneeName(task);
            const taskLabel = task.title ?? TYPE_LABELS[task.type];

            return (
              <TableRow
                key={task.id}
                sx={(theme) => ({
                  bgcolor: overdue
                    ? alpha(theme.palette.error.main, 0.1)
                    : 'background.paper',
                  '&:last-child td': { border: 0 },
                  '&:hover': {
                    bgcolor: overdue
                      ? alpha(theme.palette.error.main, 0.18)
                      : 'action.hover',
                  },
                  transition: 'background-color 0.15s',
                })}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {taskLabel}
                  </Typography>
                </TableCell>

                <TableCell>
                  <TaskStatusChip status={task.status} />
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color={overdue ? 'error.main' : 'text.primary'}
                    fontWeight={overdue ? 600 : 400}
                  >
                    {task.dueAt
                      ? dayjs(task.dueAt).format('MMM DD, YYYY')
                      : '—'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color={task.contact?.address ? 'text.primary' : 'text.disabled'}
                    sx={{ wordBreak: 'break-word' }}
                  >
                    {task.contact?.address ?? '—'}
                  </Typography>
                </TableCell>

                <TableCell>
                  {assignee ? (
                    <Chip
                      label={assignee}
                      size="small"
                      variant="outlined"
                      sx={{ maxWidth: 160 }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  {comment ? (
                    <Tooltip title={comment.body} placement="top-start">
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 280 }}
                        >
                          {comment.body}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          noWrap
                        >
                          — {comment.author}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="right">
                  <Tooltip
                    title={closed ? 'Task is closed' : ''}
                    placement="left"
                  >
                    <span>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => onAssign(task)}
                        disabled={closed}
                        sx={{ fontWeight: 600, minWidth: 'unset' }}
                      >
                        Assign
                      </Button>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* ── Mobile card list ───────────────────────────────────────────────────────── */

function MobileTaskList({
  tasks,
  onAssign,
}: {
  tasks: Task[];
  onAssign: (t: Task) => void;
}) {
  return (
    <Stack spacing={1.5}>
      {tasks.map((task) => {
        const overdue = isOverdue(task.dueAt);
        const closed = CLOSED_STATUSES.includes(task.status);
        const comment = getLatestComment(task);
        const assignee = getAssigneeName(task);
        const contactName = task.contact?.person
          ? `${task.contact.person.firstName} ${task.contact.person.lastName}`
          : null;
        const taskLabel = task.title ?? TYPE_LABELS[task.type];

        return (
          <Card
            key={task.id}
            variant="outlined"
            sx={(theme) => ({
              borderRadius: 2,
              borderColor: overdue ? 'error.light' : 'divider',
              bgcolor: overdue
                ? alpha(theme.palette.error.main, 0.1)
                : 'background.paper',
            })}
          >
            <CardContent sx={{ pb: '12px !important' }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={1}
              >
                <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                  <Typography variant="body1" fontWeight={600} noWrap>
                    {taskLabel}
                  </Typography>
                  {contactName && (
                    <Typography variant="caption" color="text.secondary">
                      {contactName}
                    </Typography>
                  )}
                  {task.contact?.address && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      noWrap
                    >
                      {task.contact.address}
                    </Typography>
                  )}
                </Box>
                <TaskStatusChip status={task.status} />
              </Stack>

              <Stack direction="row" spacing={2} mb={0.75}>
                <Typography
                  variant="caption"
                  color={overdue ? 'error.main' : 'text.secondary'}
                  fontWeight={overdue ? 600 : 400}
                >
                  Due:{' '}
                  {task.dueAt ? dayjs(task.dueAt).format('MMM DD, YYYY') : '—'}
                </Typography>
              </Stack>

              <Box mb={comment ? 1 : 0}>
                {assignee ? (
                  <Chip
                    label={assignee}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ maxWidth: '100%' }}
                  />
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    Unassigned
                  </Typography>
                )}
              </Box>

              {comment && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {comment.body}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    — {comment.author}
                  </Typography>
                </>
              )}

              <Box mt={1.5} display="flex" justifyContent="flex-end">
                <Tooltip
                  title={closed ? 'Task is closed' : ''}
                  placement="left"
                >
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => onAssign(task)}
                      disabled={closed}
                    >
                      Assign
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
