import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormLabel,
  FormHelperText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import type {$TsFixMe} from "../../utils/types.ts";

interface DynamicGroupOption {
  type: 'dynamic_group_selector';
  scope: 'user' | 'tenant';
  group_category: string;
}

interface IReportField {
  id?: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'radio' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  hidden?: boolean;
  options?: string[] | DynamicGroupOption[];
}

interface DynamicGroup {
  id: number;
  name: string;
}

interface FellowshipMember {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface ScheduleData {
  exists: boolean;
  day?: number;
  label?: string;
  fellowshipGroupId?: number;
  weekdays?: { value: number; label: string }[];
}

const ReportSubmissionForm = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const [reportName, setReportName] = useState('');
  const [reportFields, setReportFields] = useState<IReportField[]>([]);
  const [formData, setFormData] = useState<Record<string, $TsFixMe>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, DynamicGroup[]>>({});
  const [dynamicLoading, setDynamicLoading] = useState<Record<string, boolean>>({});
  const [fellowshipMembers, setFellowshipMembers] = useState<Record<string, FellowshipMember[]>>({});
  const [fellowshipSchedules, setFellowshipSchedules] = useState<Record<string, ScheduleData>>({});
  const [memberSearch, setMemberSearch] = useState<Record<string, string>>({});

  useEffect(() => {
    get(
      `${remoteRoutes.reports}/${reportId}`,
      (response: $TsFixMe) => {
        if (Array.isArray(response.fields)) {
          setReportFields(response.fields);
          setReportName(response.name || 'Submit Report');
        } else {
          toast.error('Failed to load report fields');
        }
        setLoading(false);
      },
      (error: $TsFixMe) => {
        console.error('Failed to fetch report fields:', error);
        toast.error('Failed to load report');
        setLoading(false);
      },
    );
  }, [reportId]);

  const isDynamicGroupField = (field: IReportField): boolean => {
    if (!field.options || !Array.isArray(field.options)) return false;
    return field.options.some(
        (opt) => typeof opt === 'object' && opt !== null && (opt as DynamicGroupOption).type === 'dynamic_group_selector',
    );
  };
  const getDynamicConfig = (field: IReportField): DynamicGroupOption | null => {
    if (!field.options || !Array.isArray(field.options)) return null;
    const opt = field.options.find(
        (o) => typeof o === 'object' && o !== null && (o as DynamicGroupOption).type === 'dynamic_group_selector',
    );
    return (opt as DynamicGroupOption) || null;
  };
  const handleChange = (name: string, value: $TsFixMe) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleDynamicGroupChange = (fieldName: string, group: DynamicGroup) => {
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes('id')) {
      handleChange(fieldName, group.id);
    } else {
      handleChange(fieldName, group.name);
    }
  };

  const fetchDynamicGroups = (field: IReportField) => {
    const config = getDynamicConfig(field);
    if (!config) return;

    setDynamicLoading((prev) => ({ ...prev, [field.name]: true }));

    let url: string;
    if (config.scope === 'user') {
      // Fetch user's groups from /api/groups/me, then filter by category client-side
      url = remoteRoutes.groupsMyGroups;
    } else {
      // Fetch all groups in category from /api/groups/categories/:categoryName
      url = `${remoteRoutes.authServer}/api/groups/categories/${encodeURIComponent(config.group_category)}`;
    }

    get(
        url,
        (response: $TsFixMe) => {
          let groups: DynamicGroup[] = Array.isArray(response) ? response : [];

          // For user scope, filter by category client-side (case-insensitive)
          if (config.scope === 'user' && config.group_category) {
            const categoryLower = config.group_category.toLowerCase();
            groups = groups.filter((g: $TsFixMe) => {
              const groupCategory = (g.categoryName || g.category?.name || g.category || '').toLowerCase();
              return groupCategory === categoryLower;
            });
          }

          setDynamicOptions((prev) => ({ ...prev, [field.name]: groups }));
          setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));

          // Auto-select if only one option
          if (groups.length === 1) {
            handleDynamicGroupChange(field.name, groups[0]);
          }
        },
        (error: $TsFixMe) => {
          console.error(`Failed to fetch groups for ${field.name}:`, error);
          setDynamicOptions((prev) => ({ ...prev, [field.name]: [] }));
          setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));
        },
    );
  };


  const isDynamicScheduleField = (field: IReportField): boolean => {
    if (!field.options || !Array.isArray(field.options)) return false;
    return field.options.some(
      (opt) => typeof opt === 'object' && opt !== null && (opt as $TsFixMe).type === 'dynamic_fellowship_schedule',
    );
  };

  const isDynamicMemberField = (field: IReportField): boolean => {
    if (!field.options || !Array.isArray(field.options)) return false;
    return field.options.some(
      (opt) => typeof opt === 'object' && opt !== null && (opt as $TsFixMe).type === 'dynamic_member_selector',
    );
  };

  const fetchFellowshipSchedule = (field: IReportField) => {
    setDynamicLoading((prev) => ({ ...prev, [field.name]: true }));
    get(
      `${remoteRoutes.fellowships}/my-schedule`,
      (response: ScheduleData) => {
        setFellowshipSchedules((prev) => ({ ...prev, [field.name]: response }));
        setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));
        if (response.exists && response.day !== undefined) {
          handleChange(field.name, response.day);
        }
      },
      (error: $TsFixMe) => {
        console.error('Failed to fetch fellowship schedule:', error);
        setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));
      },
    );
  };

  const fetchFellowshipMembers = (field: IReportField) => {
    setDynamicLoading((prev) => ({ ...prev, [field.name]: true }));
    get(
      `${remoteRoutes.fellowships}/my-members`,
      (response: FellowshipMember[]) => {
        setFellowshipMembers((prev) => ({
          ...prev,
          [field.name]: Array.isArray(response) ? response : [],
        }));
        setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));
      },
      (error: $TsFixMe) => {
        console.error('Failed to fetch fellowship members:', error);
        setFellowshipMembers((prev) => ({ ...prev, [field.name]: [] }));
        setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));
      },
    );
  };

  // Fetch dynamic options when fields are loaded
  useEffect(() => {
    reportFields.forEach((field) => {
      if (field.type === 'select' && isDynamicGroupField(field)) {
        fetchDynamicGroups(field);
      }
      if (field.type === 'select' && isDynamicScheduleField(field)) {
        fetchFellowshipSchedule(field);
      }
      if (field.type === 'checkbox' && isDynamicMemberField(field)) {
        fetchFellowshipMembers(field);
      }
    });
  }, [reportFields]);







  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    reportFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name];
        const isEmpty =
          field.type === 'checkbox'
            ? !Array.isArray(value) || value.length === 0
            : value === undefined || value === null || value === '';
        if (isEmpty) {
          errors[field.name] = `${field.label || field.name} is required`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fill out all required fields');
      return;
    }

    setSubmitting(true);

    // Backend expects: { data: { fieldName: value, ... } }
    const submissionData = {
      data: formData,
    };

    // Use correct endpoint: POST /api/reports/:reportId/submissions
    post(
      `${remoteRoutes.reports}/${reportId}/submissions`,
      submissionData,
      () => {
        toast.success('Report submitted successfully');
        navigate(localRoutes.dashboard);
      },
      (error: $TsFixMe) => {
        console.error('Submission failed:', error);
        const message = error?.response?.data?.message || 'Failed to submit report';
        toast.error(message);
        setSubmitting(false);
      },
    );
  };

  const renderField = (field: IReportField) => {
    if (field.hidden) return null;

    const value = formData[field.name] ?? '';
    const hasError = !!validationErrors[field.name];

    // Fellowship schedule selector
    if (field.type === 'select' && isDynamicScheduleField(field)) {
      const schedule = fellowshipSchedules[field.name];
      const isLoading = dynamicLoading[field.name];

      if (isLoading) {
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="textSecondary">Loading {field.label}...</Typography>
          </Box>
        );
      }

      if (schedule?.exists) {
        return (
          <Box sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.300', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{field.label}</Typography>
            <Typography fontWeight="medium">We meet on {schedule.label}</Typography>
          </Box>
        );
      }

      return (
        <FormControl fullWidth error={hasError}>
          <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
          <Select
            value={value}
            label={`${field.label}${field.required ? ' *' : ''}`}
            onChange={(e) => handleChange(field.name, e.target.value)}
          >
            {schedule?.weekdays?.map((day) => (
              <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>
            ))}
          </Select>
          {hasError && <FormHelperText>{validationErrors[field.name]}</FormHelperText>}
        </FormControl>
      );
    }

    // Fellowship member checklist
    if (field.type === 'checkbox' && isDynamicMemberField(field)) {
      const members = fellowshipMembers[field.name] || [];
      const isLoading = dynamicLoading[field.name];
      const search = memberSearch[field.name] || '';
      const selectedIds: number[] = Array.isArray(formData[field.name]) ? formData[field.name] : [];
      const filtered = members.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()),
      );

      const toggleMember = (id: number) => {
        const next = selectedIds.includes(id)
          ? selectedIds.filter((i) => i !== id)
          : [...selectedIds, id];
        handleChange(field.name, next);
      };

      if (isLoading) {
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="textSecondary">Loading {field.label}...</Typography>
          </Box>
        );
      }

      return (
        <FormControl fullWidth error={hasError} component="fieldset">
          <FormLabel component="legend">{field.label}{field.required ? ' *' : ''}</FormLabel>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
            {selectedIds.length} of {members.length} members selected
          </Typography>
          <TextField
            size="small"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setMemberSearch((prev) => ({ ...prev, [field.name]: e.target.value }))}
            sx={{ mb: 1 }}
          />
          <Box
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              border: '1px solid',
              borderColor: hasError ? 'error.main' : 'divider',
              borderRadius: 1,
            }}
          >
            {filtered.map((member) => (
              <FormControlLabel
                key={member.id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    size="small"
                  />
                }
                label={`${member.firstName} ${member.lastName}`}
                sx={{ display: 'flex', mx: 0, px: 1, '&:hover': { bgcolor: 'action.hover' } }}
              />
            ))}
            {filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                {search ? 'No members match your search' : 'No members found'}
              </Typography>
            )}
          </Box>
          {hasError && <FormHelperText>{validationErrors[field.name]}</FormHelperText>}
        </FormControl>
      );
    }

    // Dynamic group selector
    if (field.type === 'select' && isDynamicGroupField(field)) {
      const groups = dynamicOptions[field.name] || [];
      const isLoading = dynamicLoading[field.name];
      const autoSelected = groups.length === 1;

      if (isLoading) {
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="textSecondary">Loading {field.label}...</Typography>
          </Box>
        );
      }

      if (groups.length === 0) {
        return (
          <Alert severity="error" variant="outlined">
            No {field.label?.toLowerCase()} available
          </Alert>
        );
      }

      // Determine what value to display/store based on field name
      const lowerName = field.name.toLowerCase();
      const useId = lowerName.includes('id');

      return (
        <FormControl fullWidth error={hasError} disabled={autoSelected}>
          <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
          <Select
            value={value}
            label={`${field.label}${field.required ? ' *' : ''}`}
            onChange={(e) => {
              const selected = groups.find((g) =>
                useId ? g.id === e.target.value : g.name === e.target.value,
              );
              if (selected) handleDynamicGroupChange(field.name, selected);
            }}
            sx={autoSelected ? { backgroundColor: 'success.50' } : undefined}
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={useId ? group.id : group.name}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
          {hasError && <FormHelperText>{validationErrors[field.name]}</FormHelperText>}
        </FormControl>
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.label}
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={hasError}
            helperText={validationErrors[field.name]}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={field.label}
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={hasError}
            helperText={validationErrors[field.name]}
          />
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={field.label}
              value={value ? parseISO(value) : null}
              onChange={((date: Date | null) => handleChange(field.name, date ? format(date, 'yyyy-MM-dd') : '')) as $TsFixMe}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: field.required,
                  error: hasError,
                  helperText: validationErrors[field.name],
                },
              }}
            />
          </LocalizationProvider>
        );

      case 'radio':
        return (
          <FormControl error={hasError} required={field.required}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {Array.isArray(field.options) &&
                field.options
                  .filter((opt): opt is string => typeof opt === 'string')
                  .map((option) => (
                    <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                  ))}
            </RadioGroup>
            {hasError && <FormHelperText>{validationErrors[field.name]}</FormHelperText>}
          </FormControl>
        );

      case 'select':
        return (
          <FormControl fullWidth error={hasError}>
            <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
            <Select
              value={value}
              label={`${field.label}${field.required ? ' *' : ''}`}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {Array.isArray(field.options) &&
                field.options
                  .filter((opt): opt is string => typeof opt === 'string')
                  .map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
            </Select>
            {hasError && <FormHelperText>{validationErrors[field.name]}</FormHelperText>}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={hasError}
            helperText={validationErrors[field.name]}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {reportName}
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        {reportFields.map((field) => (
          <Box key={field.name}>
            {renderField(field)}
          </Box>
        ))}

        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              backgroundColor: '#1b813e',
              '&:hover': { backgroundColor: '#15662f' },
              fontWeight: 'bold',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(localRoutes.dashboard)}
            disabled={submitting}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ReportSubmissionForm;
