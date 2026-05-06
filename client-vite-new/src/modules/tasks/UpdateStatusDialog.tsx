import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  FormLabel,
  FormControl,
  Autocomplete,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUpdateTaskStatus } from './hooks';
import {
  TaskStatus,
  STATUS_LABELS,
  NEXT_STATUS_OPTIONS,
  CLOSED_STATUSES,
  type Task,
} from '../../utils/types';
import ajax from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface Props {
  open: boolean;
  task: Task;
  onClose: () => void;
  onSuccess: (updated: Task) => void;
}

interface Group {
  id: number;
  name: string;
}

function getValidationSchema(status: TaskStatus) {
  if (
    status === TaskStatus.ATTENDED_FELLOWSHIP ||
    status === TaskStatus.JOINED_SERVING_TEAM
  ) {
    return Yup.object({
      groupId: Yup.number().required('Fellowship/group is required'),
      activityDate: Yup.string().required('Date is required'),
    });
  }
  if (status === TaskStatus.GOT_BAPTISED) {
    return Yup.object({
      baptismDate: Yup.string().required('Date of baptism is required'),
    });
  }
  return Yup.object({});
}

export default function UpdateStatusDialog({
  open,
  task,
  onClose,
  onSuccess,
}: Props) {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [groups, setGroups] = useState<Group[]>([]);
  const updateStatus = useUpdateTaskStatus(task.contactId);

  const availableStatuses = NEXT_STATUS_OPTIONS.filter(
    (s) => !(CLOSED_STATUSES.includes(task.status) && s === task.status),
  );

  const formik = useFormik({
    initialValues: {
      status: availableStatuses[0] ?? TaskStatus.IN_PROGRESS,
      groupId: null as number | null,
      activityDate: dayjs().format('YYYY-MM-DD'),
      baptismDate: dayjs().format('YYYY-MM-DD'),
      baptismLocation: '',
      baptismOfficiant: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.lazy((values: any) =>
      getValidationSchema(values.status),
    ),
    onSubmit: (values) => {
      let data: Record<string, any> = { status: values.status };
      if (
        values.status === TaskStatus.ATTENDED_FELLOWSHIP ||
        values.status === TaskStatus.JOINED_SERVING_TEAM
      ) {
        data = {
          status: values.status,
          groupId: values.groupId,
          activityDate: values.activityDate,
        };
      } else if (values.status === TaskStatus.GOT_BAPTISED) {
        data = {
          status: values.status,
          baptismDate: values.baptismDate,
          ...(values.baptismLocation && {
            baptismLocation: values.baptismLocation,
          }),
          ...(values.baptismOfficiant && {
            baptismOfficiant: values.baptismOfficiant,
          }),
        };
      }
      updateStatus.mutate(
        { id: task.id, data },
        {
          onSuccess: (updated) => {
            onSuccess(updated);
            onClose();
          },
        },
      );
    },
  });

  // Fetch groups when status requires fellowship/serving team
  useEffect(() => {
    const s = formik.values.status;
    if (
      s === TaskStatus.ATTENDED_FELLOWSHIP ||
      s === TaskStatus.JOINED_SERVING_TEAM
    ) {
      const purpose =
        s === TaskStatus.ATTENDED_FELLOWSHIP ? 'fellowship' : 'serving_team';
      ajax
        .get(`${remoteRoutes.groups}`, { params: { purpose } })
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
          setGroups(list);
        })
        .catch(() => setGroups([]));
    }
  }, [formik.values.status]);

  const selectedStatus = formik.values.status;
  const needsGroup =
    selectedStatus === TaskStatus.ATTENDED_FELLOWSHIP ||
    selectedStatus === TaskStatus.JOINED_SERVING_TEAM;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isPhone}
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            width: { sm: '50vw' },
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '50vh',
          },
        },
        backdrop: {
          sx: {
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Update Task Status</DialogTitle>
        <DialogContent dividers={isPhone}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl>
              <FormLabel>New Status</FormLabel>
              <RadioGroup
                value={formik.values.status}
                onChange={(e) => formik.setFieldValue('status', e.target.value)}
                sx={{ gap: { xs: 0.5, sm: 0 } }}
              >
                {availableStatuses.map((s) => (
                  <FormControlLabel
                    key={s}
                    value={s}
                    control={<Radio />}
                    label={STATUS_LABELS[s]}
                    sx={{
                      alignItems: 'center',
                      border: { xs: '1px solid', sm: 'none' },
                      borderColor: { xs: 'divider', sm: 'transparent' },
                      borderRadius: 1.5,
                      m: 0,
                      px: { xs: 1, sm: 0 },
                      py: { xs: 0.75, sm: 0 },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {needsGroup && (
              <>
                <Autocomplete
                  options={groups}
                  getOptionLabel={(g) => g.name}
                  onChange={(_, val) =>
                    formik.setFieldValue('groupId', val?.id ?? null)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Fellowship / Group"
                      required
                      error={
                        formik.touched.groupId && Boolean(formik.errors.groupId)
                      }
                      helperText={
                        formik.touched.groupId &&
                        (formik.errors.groupId as string)
                      }
                    />
                  )}
                />
                <DatePicker
                  label="Date"
                  value={dayjs(formik.values.activityDate)}
                  onChange={(val) =>
                    formik.setFieldValue(
                      'activityDate',
                      val ? dayjs(val).format('YYYY-MM-DD') : '',
                    )
                  }
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </>
            )}

            {selectedStatus === TaskStatus.GOT_BAPTISED && (
              <>
                <DatePicker
                  label="Date of Baptism"
                  value={dayjs(formik.values.baptismDate)}
                  onChange={(val) =>
                    formik.setFieldValue(
                      'baptismDate',
                      val ? dayjs(val).format('YYYY-MM-DD') : '',
                    )
                  }
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <TextField
                  label="Location"
                  value={formik.values.baptismLocation}
                  onChange={formik.handleChange}
                  name="baptismLocation"
                  fullWidth
                />
                <TextField
                  label="Officiant"
                  value={formik.values.baptismOfficiant}
                  onChange={formik.handleChange}
                  name="baptismOfficiant"
                  fullWidth
                />
              </>
            )}

            {selectedStatus === TaskStatus.MATCHED_TO_FELLOWSHIP && (
              <Alert severity="info">
                This will record that the contact has been matched to a
                fellowship.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} fullWidth={isPhone}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateStatus.isPending}
            fullWidth={isPhone}
            startIcon={
              updateStatus.isPending ? (
                <CircularProgress size={16} />
              ) : undefined
            }
          >
            Update Status
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
