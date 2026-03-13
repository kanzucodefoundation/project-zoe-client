import { useState } from 'react';
import {
  Container, Typography, Box, Stack, Chip, Button,
  Autocomplete, TextField, CircularProgress,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAllTasks } from './hooks';
import TaskStatusChip from './TaskStatusChip';
import TaskTypeChip from './TaskTypeChip';
import TaskDrawer from './TaskDrawer';
import {
  TaskStatus, TaskType, STATUS_LABELS, TYPE_LABELS,
  type Task, type TaskFilters,
} from '../../utils/types';
import { localRoutes, remoteRoutes } from '../../data/constants';
import ajax from '../../utils/ajax';
import { useEffect } from 'react';

interface UserOption {
  id: number | 'unassigned';
  username: string;
}

const UNASSIGNED: UserOption = { id: 'unassigned', username: 'Unassigned' };

export default function TaskQueue() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<TaskType[]>([]);
  const [assignedTo, setAssignedTo] = useState<UserOption | null>(null);
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<UserOption[]>([UNASSIGNED]);

  useEffect(() => {
    ajax.get(remoteRoutes.users).then((r) => {
      const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
      setUsers([UNASSIGNED, ...list]);
    }).catch(() => {});
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

  const hasFilters = statusFilter.length > 0 || typeFilter.length > 0 || assignedTo !== null;

  const toggleStatus = (s: TaskStatus) => {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const toggleType = (t: TaskType) => {
    setTypeFilter((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const columns: GridColDef[] = [
    {
      field: 'contact',
      headerName: 'Contact',
      width: 180,
      renderCell: ({ row }: { row: Task }) => {
        const name = row.contact?.person
          ? `${row.contact.person.firstName} ${row.contact.person.lastName}`.trim()
          : '—';
        return (
          <Link
            to={`${localRoutes.contacts}/${row.contactId}`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {name}
          </Link>
        );
      },
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      renderCell: ({ row }: { row: Task }) => <TaskTypeChip type={row.type} />,
    },
    {
      field: 'title',
      headerName: 'Task',
      flex: 1,
      valueGetter: (_: unknown, row: Task) => row.title ?? TYPE_LABELS[row.type],
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: ({ row }: { row: Task }) => <TaskStatusChip status={row.status} />,
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
      valueGetter: (_: unknown, row: Task) => row.assignedTo?.username ?? 'Unassigned',
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
      valueGetter: (_: unknown, row: Task) => dayjs(row.createdAt).format('DD MMM YYYY'),
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4">Task Queue</Typography>
      </Box>

      {/* Filters */}
      <Stack direction="row" flexWrap="wrap" spacing={1} mb={2} alignItems="center">
        {Object.values(TaskStatus).map((s) => (
          <Chip
            key={s}
            label={STATUS_LABELS[s]}
            size="small"
            color={statusFilter.includes(s) ? 'primary' : 'default'}
            variant={statusFilter.includes(s) ? 'filled' : 'outlined'}
            onClick={() => toggleStatus(s)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
        <Box sx={{ width: 16 }} />
        {Object.values(TaskType).map((t) => (
          <Chip
            key={t}
            label={TYPE_LABELS[t]}
            size="small"
            color={typeFilter.includes(t) ? 'primary' : 'default'}
            variant={typeFilter.includes(t) ? 'filled' : 'outlined'}
            onClick={() => toggleType(t)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
        <Autocomplete
          options={users}
          getOptionLabel={(u) => u.username}
          value={assignedTo}
          onChange={(_, val) => {
            setAssignedTo(val);
            setPagination((p) => ({ ...p, page: 0 }));
          }}
          sx={{ width: 180 }}
          renderInput={(params) => <TextField {...params} label="Assigned to" size="small" />}
        />
        {hasFilters && (
          <Button
            size="small"
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

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
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
