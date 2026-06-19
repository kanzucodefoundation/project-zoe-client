import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { postGuest } from './api';
import type { GuestPayload } from './types';

interface Props {
  open: boolean;
  serviceId: number;
  onClose: () => void;
}

const schema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phone: Yup.string()
    .matches(/^[+\d\s()-]{7,15}$/, 'Invalid phone number')
    .optional(),
  isFirstTime: Yup.boolean(),
  isChild: Yup.boolean(),
});

export default function GuestDialog({ open, serviceId, onClose }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: GuestPayload) => postGuest(serviceId, payload),
    onSuccess: () => {
      toast.success('Guest added and checked in!');
      queryClient.invalidateQueries({ queryKey: ['roster', serviceId] });
      queryClient.invalidateQueries({
        queryKey: ['attendance-stats', serviceId],
      });
      onClose();
      formik.resetForm();
    },
    onError: () => {
      toast.error('Failed to add guest. Please try again.');
    },
  });

  const formik = useFormik<GuestPayload>({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      isFirstTime: true,
      isChild: false,
    },
    validationSchema: schema,
    onSubmit: (values) => {
      mutation.mutate({
        ...values,
        phone: values.phone || undefined,
      });
    },
  });

  const handleClose = () => {
    if (!mutation.isPending) {
      onClose();
      formik.resetForm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="guest-dialog-title"
    >
      <DialogTitle id="guest-dialog-title">Quick Guest Check-In</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                required
                autoFocus
                fullWidth
                size="medium"
                inputProps={{ style: { fontSize: 16 } }}
                {...formik.getFieldProps('firstName')}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
              <TextField
                label="Last Name"
                required
                fullWidth
                size="medium"
                inputProps={{ style: { fontSize: 16 } }}
                {...formik.getFieldProps('lastName')}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Stack>

            <TextField
              label="Phone (optional)"
              fullWidth
              size="medium"
              type="tel"
              inputProps={{ style: { fontSize: 16 } }}
              {...formik.getFieldProps('phone')}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.isFirstTime}
                    onChange={(e) =>
                      formik.setFieldValue('isFirstTime', e.target.checked)
                    }
                    color="success"
                  />
                }
                label="First-time guest adult"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.isChild}
                    onChange={(e) =>
                      formik.setFieldValue('isChild', e.target.checked)
                    }
                    color="info"
                  />
                }
                label="Child"
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={mutation.isPending}
            startIcon={
              mutation.isPending ? <CircularProgress size={16} /> : null
            }
            sx={{ minWidth: 140, minHeight: 44 }}
          >
            {mutation.isPending ? 'Adding…' : 'Add & Check In'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
