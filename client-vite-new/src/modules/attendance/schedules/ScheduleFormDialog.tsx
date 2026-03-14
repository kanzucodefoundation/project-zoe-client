import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { fetchLocations } from '../api';
import { createSchedule, updateSchedule } from './api';
import type {
  CreateSchedulePayload,
  Frequency,
  ServiceSchedule,
  ServiceType,
} from './types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUGGESTED_TAGS: { category: string; tags: string[] }[] = [
  { category: 'Timing', tags: ['First', 'Second', 'Third', 'Morning', 'Evening'] },
  { category: 'Language', tags: ['English', 'Luganda', 'Swahili'] },
  { category: 'Audience', tags: ['Youth', 'Adults', 'Children', 'Mixed'] },
];
const ALL_SUGGESTED = SUGGESTED_TAGS.flatMap((g) => g.tags);

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  locationGroupId: Yup.number()
    .required('Location is required')
    .min(1, 'Location is required'),
  serviceType: Yup.string()
    .oneOf(['Sunday', 'Midweek', 'Special'])
    .required('Service type is required'),
  startTime: Yup.string()
    .matches(/^\d{2}:\d{2}$/, 'Use HH:MM format')
    .required('Start time is required'),
  frequency: Yup.string()
    .oneOf(['weekly', 'biweekly', 'monthly'])
    .required('Frequency is required'),
  daysOfWeek: Yup.array()
    .of(Yup.number())
    .min(1, 'Select at least one day')
    .required(),
  tags: Yup.array().of(Yup.string()),
  metaData: Yup.object({
    expectedAttendance: Yup.number().min(0).optional(),
    hasChildrensProgram: Yup.boolean(),
    livestreamEnabled: Yup.boolean(),
  }).optional(),
  isActive: Yup.boolean(),
});

interface FormValues {
  name: string;
  locationGroupId: number;
  serviceType: ServiceType;
  startTime: string;
  frequency: Frequency;
  daysOfWeek: number[];
  tags: string[];
  metaData: {
    expectedAttendance: number | '';
    hasChildrensProgram: boolean;
    livestreamEnabled: boolean;
  };
  isActive: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: ServiceSchedule | null;
}

const defaultValues: FormValues = {
  name: '',
  locationGroupId: 0,
  serviceType: 'Sunday',
  startTime: '09:00',
  frequency: 'weekly',
  daysOfWeek: [0],
  tags: [],
  metaData: {
    expectedAttendance: '',
    hasChildrensProgram: false,
    livestreamEnabled: false,
  },
  isActive: true,
};

export default function ScheduleFormDialog({ open, onClose, editing }: Props) {
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: CreateSchedulePayload = {
        name: values.name,
        locationGroupId: values.locationGroupId,
        serviceType: values.serviceType,
        startTime: values.startTime,
        frequency: values.frequency,
        daysOfWeek: values.daysOfWeek,
        tags: values.tags.length ? values.tags : undefined,
        metaData: {
          expectedAttendance:
            values.metaData.expectedAttendance !== ''
              ? Number(values.metaData.expectedAttendance)
              : undefined,
          hasChildrensProgram: values.metaData.hasChildrensProgram,
          livestreamEnabled: values.metaData.livestreamEnabled,
        },
      };
      if (editing) {
        return updateSchedule(editing.id, { ...payload, isActive: values.isActive });
      }
      return createSchedule(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Schedule updated.' : 'Schedule created.');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      handleClose();
    },
    onError: () => {
      toast.error('Failed to save schedule. Please try again.');
    },
  });

  const formik = useFormik<FormValues>({
    initialValues: defaultValues,
    validationSchema: schema,
    onSubmit: (values) => mutation.mutate(values),
  });

  // Populate form when editing
  useEffect(() => {
    if (open && editing) {
      formik.resetForm({
        values: {
          name: editing.name,
          locationGroupId: editing.locationGroupId,
          serviceType: editing.serviceType,
          startTime: editing.startTime,
          frequency: editing.frequency,
          daysOfWeek: editing.daysOfWeek,
          tags: editing.tags ?? [],
          metaData: {
            expectedAttendance: editing.metaData?.expectedAttendance ?? '',
            hasChildrensProgram: editing.metaData?.hasChildrensProgram ?? false,
            livestreamEnabled: editing.metaData?.livestreamEnabled ?? false,
          },
          isActive: editing.isActive,
        },
      });
    } else if (open && !editing) {
      formik.resetForm({ values: defaultValues });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const handleClose = () => {
    if (!mutation.isPending) {
      onClose();
      formik.resetForm({ values: defaultValues });
    }
  };

  const toggleDay = (day: number) => {
    const current = formik.values.daysOfWeek;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    formik.setFieldValue('daysOfWeek', next);
  };

  const selectedLocation =
    locations.find((l) => l.id === formik.values.locationGroupId) ?? null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="schedule-dialog-title"
    >
      <DialogTitle id="schedule-dialog-title">
        {editing ? 'Edit Schedule' : 'New Service Schedule'}
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {/* Name */}
            <TextField
              label="Schedule name"
              required
              fullWidth
              autoFocus
              {...formik.getFieldProps('name')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            {/* Location */}
            <Autocomplete
              options={locations}
              getOptionLabel={(o) => o.name}
              value={selectedLocation}
              loading={loadingLocations}
              onChange={(_, opt) =>
                formik.setFieldValue('locationGroupId', opt?.id ?? 0)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  required
                  error={
                    formik.touched.locationGroupId &&
                    Boolean(formik.errors.locationGroupId)
                  }
                  helperText={
                    formik.touched.locationGroupId &&
                    formik.errors.locationGroupId
                  }
                />
              )}
            />

            {/* Service type + frequency */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Service type</InputLabel>
                <Select
                  label="Service type"
                  {...formik.getFieldProps('serviceType')}
                >
                  <MenuItem value="Sunday">Sunday</MenuItem>
                  <MenuItem value="Midweek">Midweek</MenuItem>
                  <MenuItem value="Special">Special</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select label="Frequency" {...formik.getFieldProps('frequency')}>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Start time */}
            <TextField
              label="Start time"
              required
              type="time"
              inputProps={{ step: 300 }}
              sx={{ maxWidth: 180 }}
              {...formik.getFieldProps('startTime')}
              error={formik.touched.startTime && Boolean(formik.errors.startTime)}
              helperText={
                (formik.touched.startTime && formik.errors.startTime) ||
                'HH:MM (24-hour)'
              }
            />

            {/* Days of week */}
            <FormControl
              error={
                formik.touched.daysOfWeek && Boolean(formik.errors.daysOfWeek)
              }
            >
              <FormLabel>Days of week</FormLabel>
              <FormGroup row sx={{ mt: 0.5, gap: 0.5 }}>
                {DAYS.map((day, i) => (
                  <FormControlLabel
                    key={day}
                    label={day}
                    labelPlacement="bottom"
                    sx={{ m: 0 }}
                    control={
                      <Checkbox
                        checked={formik.values.daysOfWeek.includes(i)}
                        onChange={() => toggleDay(i)}
                        size="small"
                      />
                    }
                  />
                ))}
              </FormGroup>
              {formik.touched.daysOfWeek && formik.errors.daysOfWeek && (
                <FormHelperText>{String(formik.errors.daysOfWeek)}</FormHelperText>
              )}
            </FormControl>

            {/* Tags */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Tags (optional)
              </Typography>
              {/* Suggested tags */}
              {SUGGESTED_TAGS.map((group) => (
                <Box key={group.category} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.disabled">
                    {group.category}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {group.tags.map((tag) => {
                      const selected = formik.values.tags.includes(tag);
                      return (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          color={selected ? 'primary' : 'default'}
                          variant={selected ? 'filled' : 'outlined'}
                          onClick={() => {
                            const next = selected
                              ? formik.values.tags.filter((t) => t !== tag)
                              : [...formik.values.tags, tag];
                            formik.setFieldValue('tags', next);
                          }}
                          clickable
                        />
                      );
                    })}
                  </Box>
                </Box>
              ))}
              {/* Custom tag input */}
              <Autocomplete
                multiple
                freeSolo
                options={ALL_SUGGESTED.filter(
                  (t) => !formik.values.tags.includes(t),
                )}
                value={formik.values.tags}
                onChange={(_, val) => formik.setFieldValue('tags', val)}
                renderTags={(val, getTagProps) =>
                  val.map((option, index) => (
                    <Chip
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Add custom tag…"
                    helperText="Press Enter to add"
                  />
                )}
              />
            </Box>

            {/* Metadata */}
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Optional settings
              </Typography>
              <TextField
                label="Expected attendance"
                type="number"
                size="small"
                sx={{ maxWidth: 200 }}
                inputProps={{ min: 0 }}
                value={formik.values.metaData.expectedAttendance}
                onChange={(e) =>
                  formik.setFieldValue(
                    'metaData.expectedAttendance',
                    e.target.value,
                  )
                }
              />
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.metaData.hasChildrensProgram}
                      onChange={(e) =>
                        formik.setFieldValue(
                          'metaData.hasChildrensProgram',
                          e.target.checked,
                        )
                      }
                    />
                  }
                  label="Children's program"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.metaData.livestreamEnabled}
                      onChange={(e) =>
                        formik.setFieldValue(
                          'metaData.livestreamEnabled',
                          e.target.checked,
                        )
                      }
                    />
                  }
                  label="Livestream"
                />
              </Stack>
            </Stack>

            {/* Active toggle — only when editing */}
            {editing && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isActive}
                    onChange={(e) =>
                      formik.setFieldValue('isActive', e.target.checked)
                    }
                    color="success"
                  />
                }
                label={formik.values.isActive ? 'Active' : 'Inactive'}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            startIcon={mutation.isPending ? <CircularProgress size={16} /> : null}
            sx={{ minWidth: 120, minHeight: 44 }}
          >
            {mutation.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
