import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PeopleIcon from '@mui/icons-material/People';
import RepeatIcon from '@mui/icons-material/Repeat';
import type { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreateTask } from './hooks';
import { TaskType, TYPE_LABELS, type Task } from '../../utils/types';
import ajax from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface Props {
  open: boolean;
  contactId: number;
  onClose: () => void;
  onSuccess: (task: Task) => void;
}

interface UserOption {
  id: number;
  username: string;
  fullName: string;
}

const TYPE_ICONS: Record<TaskType, React.ReactNode> = {
  [TaskType.CALL]: <PhoneIcon fontSize="small" />,
  [TaskType.VISIT]: <DirectionsWalkIcon fontSize="small" />,
  [TaskType.MATCH]: <PeopleIcon fontSize="small" />,
  [TaskType.FOLLOW_UP]: <RepeatIcon fontSize="small" />,
};

export default function CreateTaskDialog({
  open,
  contactId,
  onClose,
  onSuccess,
}: Props) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const createTask = useCreateTask(contactId);

  useEffect(() => {
    if (open) {
      ajax
        .get(remoteRoutes.users)
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
          setUsers(list);
        })
        .catch(() => setUsers([]));
    }
  }, [open]);

  const formik = useFormik({
    initialValues: {
      type: TaskType.CALL,
      title: '',
      assignedToId: null as number | null,
      dueAt: null as Dayjs | null,
    },
    validationSchema: Yup.object({
      type: Yup.string().required('Type is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      createTask.mutate(
        {
          contactId,
          type: values.type,
          ...(values.title && { title: values.title }),
          ...(values.assignedToId !== null && {
            assignedToId: values.assignedToId,
          }),
          ...(values.dueAt && { dueAt: values.dueAt.format('YYYY-MM-DD') }),
        },
        {
          onSuccess: (task) => {
            onSuccess(task);
            resetForm();
            onClose();
          },
        },
      );
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <ToggleButtonGroup
              exclusive
              value={formik.values.type}
              onChange={(_, val) => val && formik.setFieldValue('type', val)}
            >
              {Object.values(TaskType).map((t) => (
                <ToggleButton key={t} value={t}>
                  {TYPE_ICONS[t]}
                  <span style={{ marginLeft: 4 }}>{TYPE_LABELS[t]}</span>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField
              label="Title (optional)"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              fullWidth
            />

            <Autocomplete
              options={users}
              getOptionLabel={(u) => u.fullName}
              onChange={(_, val) =>
                formik.setFieldValue('assignedToId', val?.id ?? null)
              }
              renderInput={(params) => (
                <TextField {...params} label="Assign to (optional)" />
              )}
            />

            <DatePicker
              label="Due date (optional)"
              value={formik.values.dueAt}
              onChange={(val) => formik.setFieldValue('dueAt', val)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createTask.isPending}
            startIcon={
              createTask.isPending ? <CircularProgress size={16} /> : undefined
            }
          >
            Create Task
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
