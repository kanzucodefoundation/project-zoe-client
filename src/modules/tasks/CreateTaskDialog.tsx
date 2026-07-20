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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PeopleIcon from '@mui/icons-material/People';
import RepeatIcon from '@mui/icons-material/Repeat';
import type { Dayjs } from 'dayjs';
import { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreateTask } from './hooks';
import { TaskType, TYPE_LABELS, type Task } from '../../utils/types';
import ajax,{ search } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

interface Props {
  open: boolean;
  contactId?: number;
  onClose: () => void;
  onSuccess: (task: Task) => void;
}

interface UserOption {
  id: number;
  username: string;
  fullName: string;
}

interface ContactOption {
  id: number;
  name: string;
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
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [users, setUsers] = useState<UserOption[]>([]);
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [contactSearchLoading, setContactSearchLoading] = useState(false);
  const createTask = useCreateTask(contactId);
  const needsContactPicker = contactId === undefined;

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

  const searchContacts = useCallback((query: string) => {
    setContactSearchLoading(true);
    search(
      remoteRoutes.contacts,
      { query: query || undefined },
      (response) => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        setContactOptions(
          data.map((c: any) => ({ id: c.id, name: c.name })),
        );
        setContactSearchLoading(false);
      },
      () => {
        setContactOptions([]);
        setContactSearchLoading(false);
      },
    );
  }, []);
  const debouncedSearchContacts = useMemo(
    () => debounce((query: string) => searchContacts(query), 300),
    [searchContacts]
  );
  useEffect(() => {
    if (open && needsContactPicker) {
      searchContacts('');
    }
  }, [open, needsContactPicker, searchContacts]);

  const formik = useFormik({
    initialValues: {
      contactId: contactId ?? null as number | null,
      type: TaskType.CALL,
      title: '',
      assignedToId: null as number | null,
      dueAt: null as Dayjs | null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      type: Yup.string().required('Type is required'),
      contactId: Yup.number()
        .nullable()
        .required('Contact is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      if (values.contactId == null) return;
      createTask.mutate(
        {
          contactId: values.contactId,
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
  const handleCancel = () => {
    if (createTask.isPending) return; 
    formik.resetForm(); // Wipes the prior contact, title, assignee, etc.
    onClose();          // Triggers the parent's close state
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      fullScreen={isPhone}
      scroll="paper"
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>New Task</DialogTitle>
        <DialogContent dividers={isPhone}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {needsContactPicker && (
              <Autocomplete
                options={contactOptions}
                getOptionLabel={(c) => c.name}
                loading={contactSearchLoading}
                onInputChange={(_, val) => debouncedSearchContacts(val)}
                onChange={(_, val) =>
                  formik.setFieldValue('contactId', val?.id ?? null)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Contact"
                    required
                    error={
                      formik.touched.contactId && Boolean(formik.errors.contactId)
                    }
                    helperText={
                      formik.touched.contactId && formik.errors.contactId
                    }
                    onBlur={() => formik.setFieldTouched('contactId', true)}
                  />
                )}
              />
            )}

            <ToggleButtonGroup
              exclusive
              value={formik.values.type}
              onChange={(_, val) => val && formik.setFieldValue('type', val)}
              orientation={isPhone ? 'vertical' : 'horizontal'}
              sx={{
                alignItems: 'stretch',
                '& .MuiToggleButton-root': {
                  justifyContent: 'center',
                  minHeight: 44,
                  flex: 1,
                },
              }}
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
          <Button onClick={handleCancel} disabled={createTask.isPending} fullWidth={isPhone}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createTask.isPending}
            fullWidth={isPhone}
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