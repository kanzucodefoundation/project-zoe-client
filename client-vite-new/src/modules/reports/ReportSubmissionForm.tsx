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
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import type { $TsFixMe } from '../../utils/types.ts';
import type { RootState } from '../../data/store';

interface DynamicGroupOption {
  type: 'dynamic_group_selector';
  scope: 'user' | 'tenant';
  group_category: string;
}

interface IReportField {
  id?: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'radio' | 'select' | 'textarea';
  required?: boolean;
  hidden?: boolean;
  options?: string[] | DynamicGroupOption[];
}

interface DynamicGroup {
  id: number;
  name: string;
}

interface GroupResponseNode extends DynamicGroup {
  categoryName?: string;
  category?: { name?: string } | string | null;
  children?: GroupResponseNode[];
}

type ManagedGroupRef =
  | number
  | string
  | { id?: number | string; groupId?: number | string };

const normalizeGroups = (response: $TsFixMe): GroupResponseNode[] => {
  const source = Array.isArray(response)
    ? response
    : Array.isArray(response?.groups)
    ? response.groups
    : [];

  const stack = [...source];
  const seen = new Set<string>();
  const groups: GroupResponseNode[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') {
      continue;
    }

    if (Array.isArray(current.children) && current.children.length > 0) {
      stack.push(...current.children);
    }

    if (current.id === undefined || !current.name) {
      continue;
    }

    const key = `${current.id}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    groups.push(current as GroupResponseNode);
  }

  return groups.sort((a, b) => a.name.localeCompare(b.name));
};

const filterGroupsByCategory = (
  groups: GroupResponseNode[],
  categoryName: string,
): GroupResponseNode[] => {
  const category = categoryName.trim().toLowerCase();
  return groups.filter((group) => {
    const rawCategory =
      typeof group.category === 'string'
        ? group.category
        : group.category?.name || group.categoryName || '';
    return rawCategory.toLowerCase() === category;
  });
};

const getManagedGroupIdSet = (
  groups: ManagedGroupRef[] | undefined,
): Set<string> => {
  if (!Array.isArray(groups)) {
    return new Set<string>();
  }

  return new Set(
    groups
      .map((group) => {
        if (typeof group === 'number' || typeof group === 'string') {
          return `${group}`;
        }
        return `${group.id ?? group.groupId ?? ''}`;
      })
      .filter(Boolean),
  );
};

const ReportSubmissionForm = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);

  const [reportName, setReportName] = useState('');
  const [reportFields, setReportFields] = useState<IReportField[]>([]);
  const [formData, setFormData] = useState<Record<string, $TsFixMe>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, DynamicGroup[]>
  >({});
  const [dynamicLoading, setDynamicLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [smallGroups, setSmallGroups] = useState<DynamicGroup[]>([]);
  const [smallGroupsLoading, setSmallGroupsLoading] = useState(false);

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
      (opt) =>
        typeof opt === 'object' &&
        opt !== null &&
        (opt as DynamicGroupOption).type === 'dynamic_group_selector',
    );
  };
  const getDynamicConfig = (field: IReportField): DynamicGroupOption | null => {
    if (!field.options || !Array.isArray(field.options)) return null;
    const opt = field.options.find(
      (o) =>
        typeof o === 'object' &&
        o !== null &&
        (o as DynamicGroupOption).type === 'dynamic_group_selector',
    );
    return (opt as DynamicGroupOption) || null;
  };

  const isSmallGroupNameField = (field: IReportField): boolean =>
    field.name === 'smallGroupName';

  const handleChange = (name: string, value: $TsFixMe) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSmallGroupChange = (group: DynamicGroup | null) => {
    setFormData((prev) => {
      const next = { ...prev };

      if (group) {
        next.smallGroupName = group.name;
        next.smallGroupId = group.id;
      } else {
        delete next.smallGroupName;
        delete next.smallGroupId;
      }

      return next;
    });

    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.smallGroupName;
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
      url = `${
        remoteRoutes.authServer
      }/api/groups/categories/${encodeURIComponent(config.group_category)}`;
    }

    get(
      url,
      (response: $TsFixMe) => {
        let groups = normalizeGroups(response);

        // For user scope, filter by category client-side (case-insensitive)
        if (config.scope === 'user' && config.group_category) {
          groups = filterGroupsByCategory(groups, config.group_category);
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

  const fetchSmallGroups = () => {
    setSmallGroupsLoading(true);

    get(
      remoteRoutes.groupsMyGroups,
      (response: $TsFixMe) => {
        const managedGroupIds = getManagedGroupIdSet(user?.canManageGroups);
        const availableGroups = filterGroupsByCategory(
          normalizeGroups(response),
          'Missional Community',
        );
        const managedGroups =
          managedGroupIds.size > 0
            ? availableGroups.filter((group) =>
                managedGroupIds.has(`${group.id}`),
              )
            : availableGroups;
        const groups =
          managedGroupIds.size > 0 && managedGroups.length === 0
            ? availableGroups
            : managedGroups;

        setSmallGroups(groups);
        setSmallGroupsLoading(false);

        if (groups.length === 1) {
          setFormData((prev) => {
            if (prev.smallGroupName || prev.smallGroupId) {
              return prev;
            }

            return {
              ...prev,
              smallGroupName: groups[0].name,
              smallGroupId: groups[0].id,
            };
          });

          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next.smallGroupName;
            return next;
          });
        }
      },
      (error: $TsFixMe) => {
        console.error('Failed to fetch missional communities:', error);
        setSmallGroups([]);
        setSmallGroupsLoading(false);
      },
    );
  };

  // Fetch dynamic group options when fields are loaded
  useEffect(() => {
    reportFields.forEach((field) => {
      if (field.type === 'select' && isDynamicGroupField(field)) {
        fetchDynamicGroups(field);
      }
    });
  }, [reportFields]);

  useEffect(() => {
    if (reportFields.some(isSmallGroupNameField)) {
      fetchSmallGroups();
    }
  }, [reportFields, user?.canManageGroups]);

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    reportFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name];
        if (value === undefined || value === null || value === '') {
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
        const message =
          error?.response?.data?.message || 'Failed to submit report';
        toast.error(message);
        setSubmitting(false);
      },
    );
  };

  const renderField = (field: IReportField) => {
    if (field.hidden) return null;

    const value = formData[field.name] ?? '';
    const hasError = !!validationErrors[field.name];

    if (isSmallGroupNameField(field)) {
      const autoSelected = smallGroups.length === 1;

      if (smallGroupsLoading) {
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="textSecondary">
              Loading {field.label}...
            </Typography>
          </Box>
        );
      }

      if (smallGroups.length === 0) {
        return (
          <Alert severity="warning" variant="outlined">
            No missional communities assigned to you were found.
          </Alert>
        );
      }

      return (
        <FormControl fullWidth error={hasError} disabled={autoSelected}>
          <InputLabel>
            {field.label}
            {field.required ? ' *' : ''}
          </InputLabel>
          <Select
            value={value}
            label={`${field.label}${field.required ? ' *' : ''}`}
            onChange={(e) => {
              const selected = smallGroups.find(
                (group) => group.name === e.target.value,
              );
              handleSmallGroupChange(selected || null);
            }}
            sx={autoSelected ? { backgroundColor: 'success.50' } : undefined}
          >
            {smallGroups.map((group) => (
              <MenuItem key={group.id} value={group.name}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
          {hasError && (
            <FormHelperText>{validationErrors[field.name]}</FormHelperText>
          )}
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
            <Typography variant="body2" color="textSecondary">
              Loading {field.label}...
            </Typography>
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
          <InputLabel>
            {field.label}
            {field.required ? ' *' : ''}
          </InputLabel>
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
          {hasError && (
            <FormHelperText>{validationErrors[field.name]}</FormHelperText>
          )}
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
              onChange={
                ((date: Date | null) =>
                  handleChange(
                    field.name,
                    date ? format(date, 'yyyy-MM-dd') : '',
                  )) as $TsFixMe
              }
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
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
            </RadioGroup>
            {hasError && (
              <FormHelperText>{validationErrors[field.name]}</FormHelperText>
            )}
          </FormControl>
        );

      case 'select':
        return (
          <FormControl fullWidth error={hasError}>
            <InputLabel>
              {field.label}
              {field.required ? ' *' : ''}
            </InputLabel>
            <Select
              value={value}
              label={`${field.label}${field.required ? ' *' : ''}`}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {Array.isArray(field.options) &&
                field.options
                  .filter((opt): opt is string => typeof opt === 'string')
                  .map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
            </Select>
            {hasError && (
              <FormHelperText>{validationErrors[field.name]}</FormHelperText>
            )}
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
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
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
          <Box key={field.name}>{renderField(field)}</Box>
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
