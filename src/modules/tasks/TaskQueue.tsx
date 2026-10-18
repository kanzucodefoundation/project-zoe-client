import PageHeader from '../../components/ui/PageHeader';
import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  Chip,
  Button,
  Autocomplete,
  TextField,
  CircularProgress,
  Paper,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RowActions from '../../components/ui/RowActions';
import { type GridPaginationModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useLocationScopedTasks, useMyLocationGroups } from './hooks';
import TaskStatusChip from './TaskStatusChip';
import TaskDrawer from './TaskDrawer';
import TaskCard from './TaskCard';
import {
  TaskStatus,
  TaskType,
  STATUS_LABELS,
  TYPE_LABELS,
  extractUsersByLocation,
  type Task,
  type TaskFilters,
  type UserOption,
} from '../../utils/types';
import { remoteRoutes } from '../../data/constants';
import ajax from '../../utils/ajax';

// UserOption.id is a plain `number` everywhere else (e.g. TaskDrawer's
// reassign mutation expects a real user id). This queue's filter also needs
// an "Unassigned" pseudo-option, so widen the id just for this local usage
// rather than the shared type.
type AssignableUser = Omit<UserOption, 'id'> & { id: number | 'unassigned' };

const UNASSIGNED: AssignableUser = {
  id: 'unassigned',
  username: 'Unassigned',
  fullName: 'Unassigned',
};

// Stable reference so the effect below doesn't re-run every render when
// useMyLocationGroups has no cached data yet (default `[]` would otherwise
// be a new array on each render).
const EMPTY_LOCATION_GROUP_IDS: number[] = [];

export default function TaskQueue() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<TaskType[]>([]);
  const [assignedTo, setAssignedTo] = useState<AssignableUser | null>(null);
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<AssignableUser[]>([UNASSIGNED]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [noLocationGroup, setNoLocationGroup] = useState(false);

  const { data: locationGroupIds = EMPTY_LOCATION_GROUP_IDS, isLoading: locationGroupsLoading } =
    useMyLocationGroups();

  useEffect(() => {
    if (locationGroupsLoading) return;
    if (locationGroupIds.length === 0) {
      setNoLocationGroup(true);
      setUsers([UNASSIGNED]);
      setAssignedTo(null);
      setUsersLoading(false);
      return;
    }
    setNoLocationGroup(false);
    let ignore = false;
    setUsersLoading(true);
    Promise.all(
      locationGroupIds.map((id) =>
        ajax
          .get(`${remoteRoutes.usersByLocation}/${id}`)
          .then((r) => extractUsersByLocation(r))
          .catch(() => []),
      ),
    )
      .then((results) => {
        if (ignore) return;
        const merged = results.flat();
        const deduped = Array.from(
          new Map(merged.map((u) => [u.id, u])).values(),
        );
        setUsers([UNASSIGNED, ...deduped]);
      })
      .finally(() => {
        if (!ignore) setUsersLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [locationGroupIds, locationGroupsLoading]);

  const filters: TaskFilters = {
    ...(statusFilter.length > 0 && { status: statusFilter }),
    ...(typeFilter.length > 0 && { type: typeFilter }),
    ...(assignedTo && { assignedToId: assignedTo.id }),
    page: pagination.page + 1,
    limit: pagination.pageSize,
  };

  const { data, isLoading } = useLocationScopedTasks(filters);
  const tasks = data?.data ?? [];
  const total = data?.total ?? 0;

  const hasFilters =
    statusFilter.length > 0 || typeFilter.length > 0 || assignedTo !== null;

  const toggleStatus = (s: TaskStatus) => {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const toggleType = (t: TaskType) => {
    setTypeFilter((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
    setPagination((p) => ({ ...p, page: 0 }));
  };


  return (
    <Container>
      <PageHeader
        title="Task Queue"
        meta={
          <Chip
            size="small"
            label={`${total} ${total === 1 ? 'task' : 'tasks'}`}
          />
        }
      />

      {/* Filters */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          mb: { xs: 1.5, sm: 2 },
          borderRadius: 2,
        }}
      >
        <Stack spacing={1.25}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {Object.values(TaskStatus).map((s) => (
              <Chip
                key={s}
                label={STATUS_LABELS[s]}
                size="small"
                color={statusFilter.includes(s) ? 'primary' : 'default'}
                variant={statusFilter.includes(s) ? 'filled' : 'outlined'}
                onClick={() => toggleStatus(s)}
                sx={{ cursor: 'pointer', maxHeight: 'none', py: 0.25 }}
              />
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {Object.values(TaskType).map((t) => (
              <Chip
                key={t}
                label={TYPE_LABELS[t]}
                size="small"
                color={typeFilter.includes(t) ? 'primary' : 'default'}
                variant={typeFilter.includes(t) ? 'filled' : 'outlined'}
                onClick={() => toggleType(t)}
                sx={{ cursor: 'pointer', maxHeight: 'none', py: 0.25 }}
              />
            ))}
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Autocomplete
              options={users}
              getOptionLabel={(u) => u.fullName}
              value={assignedTo}
              disabled={usersLoading || locationGroupsLoading || noLocationGroup}
              onChange={(_, val) => {
                setAssignedTo(val);
                setPagination((p) => ({ ...p, page: 0 }));
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assigned to"
                  size="small"
                  placeholder={
                    noLocationGroup ? 'No locations assigned' : undefined
                  }
                />
              )}
            />
            {hasFilters && (
              <Button
                size="small"
                fullWidth={isMobile}
                onClick={() => {
                  setStatusFilter([]);
                  setTypeFilter([]);
                  setAssignedTo(null);
                }}
              >
                Clear all
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {tasks.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No tasks match the current filters.
              </Typography>
            </Paper>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={setSelectedTask}
                showContact
              />
            ))
          )}
          {total > pagination.pageSize && (
            <Box display="flex" justifyContent="center" py={1}>
              <Pagination
                count={Math.ceil(total / pagination.pageSize)}
                page={pagination.page + 1}
                onChange={(_, page) =>
                  setPagination((current) => ({ ...current, page: page - 1 }))
                }
                color="primary"
                size="small"
                siblingCount={0}
              />
            </Box>
          )}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow hover={false}>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      No tasks match the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {task.title ?? TYPE_LABELS[task.type]}
                    </TableCell>
                    <TableCell>
                      <TaskStatusChip status={task.status} />
                    </TableCell>
                    <TableCell>
                      {task.assignedTo?.username ?? (
                        <Box component="span" sx={{ color: 'text.disabled' }}>
                          Unassigned
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.dueAt ? (
                        dayjs(task.dueAt).format('DD MMM YYYY')
                      ) : (
                        <Box component="span" sx={{ color: 'text.disabled' }}>
                          &mdash;
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {dayjs(task.createdAt).format('DD MMM YYYY')}
                    </TableCell>
                    <TableCell align="right">
                      <RowActions
                        subject={task.title ?? TYPE_LABELS[task.type]}
                        actions={[
                          {
                            label: 'Open task',
                            icon: <VisibilityOutlinedIcon fontSize="small" />,
                            onClick: () => setSelectedTask(task),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={total}
            page={pagination.page}
            onPageChange={(_, page) =>
              setPagination((current) => ({ ...current, page }))
            }
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={(e) =>
              setPagination({ page: 0, pageSize: Number(e.target.value) })
            }
          />
        </TableContainer>
      )}

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={(updated) => setSelectedTask(updated)}
      />
    </Container>
  );
}
