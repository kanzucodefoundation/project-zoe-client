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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useAllTasks } from './hooks';
import TaskStatusChip from './TaskStatusChip';
import TaskDrawer from './TaskDrawer';
import TaskCard from './TaskCard';
import {
  TaskStatus,
  TaskType,
  STATUS_LABELS,
  TYPE_LABELS,
  type Task,
  type TaskFilters,
} from '../../utils/types';
import { remoteRoutes } from '../../data/constants';
import ajax from '../../utils/ajax';

interface UserOption {
  id: number | 'unassigned';
  username: string;
  fullName: string;
}

const UNASSIGNED: UserOption = {
  id: 'unassigned',
  username: 'Unassigned',
  fullName: 'Unassigned',
};

export default function TaskQueue() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<TaskType[]>([]);
  const [assignedTo, setAssignedTo] = useState<UserOption | null>(null);
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<UserOption[]>([UNASSIGNED]);

  useEffect(() => {
    ajax
      .get(remoteRoutes.users)
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
        setUsers([UNASSIGNED, ...list]);
      })
      .catch(() => {});
  }, []);

  const filters: TaskFilters = {
    ...(statusFilter.length > 0 && { status: statusFilter }),
    ...(typeFilter.length > 0 && { type: typeFilter }),
    ...(assignedTo && { assignedToId: assignedTo.id }),
    page: pagination.page + 1,
    limit: pagination.pageSize,
  };

  const { data, isLoading } = useAllTasks(filters);
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

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Task',
      flex: 1,
      valueGetter: (_: unknown, row: Task) =>
        row.title ?? TYPE_LABELS[row.type],
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: ({ row }: { row: Task }) => (
        <TaskStatusChip status={row.status} />
      ),
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
      valueGetter: (_: unknown, row: Task) =>
        row.assignedTo?.username ?? 'Unassigned',
    },
    {
      field: 'dueAt',
      headerName: 'Due',
      width: 130,
      valueGetter: (_: unknown, row: Task) =>
        row.dueAt ? dayjs(row.dueAt).format('DD MMM YYYY') : '—',
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 130,
      valueGetter: (_: unknown, row: Task) =>
        dayjs(row.createdAt).format('DD MMM YYYY'),
    },
  ];

  return (
    <Container
      maxWidth="lg"
      disableGutters={isMobile}
      sx={{ px: { xs: 0, md: 2 } }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={0.5}
        mb={{ xs: 1.5, sm: 3 }}
      >
        <Typography variant="h4">Task Queue</Typography>
        <Typography variant="body2" color="text.secondary">
          {total} {total === 1 ? 'task' : 'tasks'}
        </Typography>
      </Stack>

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
              onChange={(_, val) => {
                setAssignedTo(val);
                setPagination((p) => ({ ...p, page: 0 }));
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
              renderInput={(params) => (
                <TextField {...params} label="Assigned to" size="small" />
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
        <DataGrid
          rows={tasks}
          columns={columns}
          rowCount={total}
          paginationMode="server"
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          pageSizeOptions={[10, 20, 50]}
          onRowClick={({ row }) => setSelectedTask(row as Task)}
          sx={{ cursor: 'pointer' }}
          autoHeight
          disableRowSelectionOnClick
        />
      )}

      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={(updated) => setSelectedTask(updated)}
      />
    </Container>
  );
}
