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
  FormGroup,
  FormHelperText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { format, parseISO } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { get, post, put } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import type { $TsFixMe } from '../../utils/types.ts';
import type { RootState } from '../../data/store';
import { useRef } from 'react';

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DynamicGroupOption {
  type: 'dynamic_group_selector';
  scope: 'user' | 'tenant';
  group_category: string;
}

interface IReportField {
  id?: string;
  name: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'radio'
    | 'select'
    | 'textarea'
    | 'checkbox';
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
  id?: number;
  day?: number;
  label?: string;
  startTime?: string;
  frequency?: string;
  fellowshipGroupId?: number;
  weekdays?: { value: number; label: string }[];
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
  const [fellowshipMembers, setFellowshipMembers] = useState<
    Record<string, FellowshipMember[]>
  >({});
  const [fellowshipSchedules, setFellowshipSchedules] = useState<
    Record<string, ScheduleData>
  >({});
  const [memberSearch, setMemberSearch] = useState<Record<string, string>>({});
  const [smallGroups, setSmallGroups] = useState<DynamicGroup[]>([]);
  const [smallGroupsLoading, setSmallGroupsLoading] = useState(false);
  const [scheduleEditOpen, setScheduleEditOpen] = useState(false);
  const [scheduleEditFieldName, setScheduleEditFieldName] = useState<string | null>(null);
  const [scheduleEditDay, setScheduleEditDay] = useState(3);
  const [scheduleEditTime, setScheduleEditTime] = useState('19:00');
  const [scheduleEditFrequency, setScheduleEditFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [scheduleEditSaving, setScheduleEditSaving] = useState(false);

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

  const isServiceLocationNameField = (field: IReportField): boolean =>
    field.name === 'serviceLocationName';

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

  const handleServiceLocationChange = (group: DynamicGroup | null) => {
    setFormData((prev) => {
      const next = { ...prev };

      if (group) {
        next.serviceLocationName = group.name;
        next.serviceLocationId = group.id;
      } else {
        delete next.serviceLocationName;
        delete next.serviceLocationId;
      }

      return next;
    });

    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.serviceLocationName;
      delete next.serviceLocationId;
      return next;
    });
  };

  const handleDynamicGroupChange = (
    field: IReportField,
    group: DynamicGroup,
  ) => {
    if (isServiceLocationNameField(field)) {
      handleServiceLocationChange(group);
      return;
    }

    const lowerName = field.name.toLowerCase();
    if (lowerName.endsWith('id')) {
      handleChange(field.name, group.id);
    } else {
      handleChange(field.name, group.name);
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
          handleDynamicGroupChange(field, groups[0]);
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

  const isDynamicScheduleField = (field: IReportField): boolean => {
    if (!field.options || !Array.isArray(field.options)) return false;
    return field.options.some(
      (opt) =>
        typeof opt === 'object' &&
        opt !== null &&
        (opt as $TsFixMe).type === 'dynamic_fellowship_schedule',
    );
  };

  const isDynamicMemberField = (field: IReportField): boolean => {
    if (!field.options || !Array.isArray(field.options)) return false;
    return field.options.some(
      (opt) =>
        typeof opt === 'object' &&
        opt !== null &&
        (opt as $TsFixMe).type === 'dynamic_member_selector',
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
  const fellowshipMembersRequestIdRef = useRef<Record<string, number>>({});
  const fetchFellowshipMembers = (field: IReportField, instantFormData?: $TsFixMe) => {
    const activeFormContext = instantFormData || formData;
    const rawGroupId = activeFormContext?.smallGroupId || activeFormContext?.groupId || null;
    const currentGroupId = rawGroupId ? Number(rawGroupId) : null;
    const requestId = (fellowshipMembersRequestIdRef.current[field.name] || 0) + 1;
    fellowshipMembersRequestIdRef.current[field.name] = requestId;
    if (!currentGroupId || isNaN(currentGroupId)) {
      setFellowshipMembers((prev) => ({ ...prev, [field.name]: [] }));
      setDynamicLoading((prev) => ({ ...prev, [field.name]: false })); 
      return;
    }
    setDynamicLoading((prev) => ({ ...prev, [field.name]: true }));
    const queryUrl = `${remoteRoutes.groupsMembership}?groupId=${currentGroupId}&limit=100&skip=0`;
    get(
      queryUrl,
      (response: $TsFixMe) => {
        if (fellowshipMembersRequestIdRef.current[field.name] !== requestId) return;
        // Support different backend response shapes: bare array, { rows: [...] }, { data: [...] }, or { results: [...] }
        const membershipRows = Array.isArray(response)
          ? response
          : Array.isArray(response?.rows)
          ? response.rows
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.results)
          ? response.results
          : [];

        if (membershipRows.length === 0) {
          console.warn(`Backend returned empty membership rows for groupId: ${currentGroupId}`);
          setFellowshipMembers((prev) => ({ ...prev, [field.name]: [] }));
          setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));
          return;
        }

        const mappedMembers = membershipRows.map((membership: $TsFixMe) => {
          const contactObj = membership.contact || {};
          const personObj = contactObj.person || {};
          return {
            id: membership.contactId || membership.id,
            firstName: personObj.firstName || contactObj.name?.split(' ')[0] || 'Unknown',
            lastName: personObj.lastName || contactObj.name?.split(' ').slice(1).join(' ') || 'Member',
          };
        });
        setFellowshipMembers((prev) => ({
          ...prev,
          [field.name]: mappedMembers,
        }));
        setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));
      },
      (error: $TsFixMe) => {
        console.error('Failed to fetch fellowship members:', error);
        setFellowshipMembers((prev) => ({ ...prev, [field.name]: [] }));
        setDynamicLoading((prev) => ({ ...prev, [field.name]: false }));
      }
  )};
  // Fetch dynamic options when fields are loaded
  useEffect(() => {
    reportFields.forEach((field) => {
      if (field.type === 'select' && isDynamicGroupField(field)) {
        fetchDynamicGroups(field);
      }
      if (field.type === 'select' && isDynamicScheduleField(field)) {
        fetchFellowshipSchedule(field);
      }
    });
  }, [reportFields]);

    // Automatically reload the members checklist whenever a leader switches the MC dropdown choice
  useEffect(() => {
    // Locate the dynamic checkbox field inside your form layout template configuration
    const memberField = reportFields.find(isDynamicMemberField);
    
    if (memberField) {
      // Pass the active form parameters context along down to the query processor string engine
      fetchFellowshipMembers(memberField);
    }
  }, [formData?.smallGroupId, formData?.groupId, reportFields]);   useEffect(() => {
    if (reportFields.some(isSmallGroupNameField)) {
      fetchSmallGroups();
    }
  }, [reportFields, user?.canManageGroups]);

  const handleScheduleSave = () => {
    if (!scheduleEditFieldName) return;
    const schedule = fellowshipSchedules[scheduleEditFieldName];
    if (!schedule?.id) return;

    setScheduleEditSaving(true);
    put(
      `${remoteRoutes.fellowships}/schedules/${schedule.id}`,
      { meetingDay: scheduleEditDay, startTime: scheduleEditTime, frequency: scheduleEditFrequency },
      () => {
        // Re-fetch so the display and form value both update
        const field = reportFields.find((f) => f.name === scheduleEditFieldName);
        if (field) fetchFellowshipSchedule(field);
        setScheduleEditOpen(false);
        setScheduleEditSaving(false);
        toast.success('Meeting schedule updated');
      },
      (error: $TsFixMe) => {
        const message = error?.response?.data?.message || 'Failed to update schedule';
        toast.error(message);
        setScheduleEditSaving(false);
      },
    );
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    let hiddenFieldMissing = false;
    reportFields.forEach((field) => {
      const value = formData[field.name];
      const hasValue = value !== undefined && value !== null && value !== '';
      if (
        field.type === 'number' &&
        hasValue &&
        (!Number.isFinite(Number(value)) || Number(value) < 0)
      ) {
        errors[field.name] = `${field.label || field.name} must be 0 or greater`;
        return;
      }
      if (!field.required) return;
      const isEmpty =        field.type === 'checkbox' ||
        (field.type === 'select' && isDynamicMemberField(field))
          ? !Array.isArray(value) || value.length === 0
          : value === undefined || value === null || value === '';
      if (!isEmpty) return;
      if (field.hidden) {
        hiddenFieldMissing = true;
      } else {
        errors[field.name] = `${field.label || field.name} is required`;
      }
    });

    if (Object.keys(errors).length > 0 || hiddenFieldMissing) {
      setValidationErrors(errors);
      toast.error(
        hiddenFieldMissing && Object.keys(errors).length === 0
          ? 'Some required information failed to load. Please refresh and try again.'
          : 'Please fill out all required fields',
      );
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

    // Small group (MC) name picker
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

    // Fellowship schedule selector
    if (field.type === 'select' && isDynamicScheduleField(field)) {
      const schedule = fellowshipSchedules[field.name];
      const isLoading = dynamicLoading[field.name];

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

      if (schedule?.exists) {
        return (
          <Box
            sx={{
              p: 2,
              bgcolor: 'success.50',
              border: '1px solid',
              borderColor: 'success.300',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {field.label}
              </Typography>
              <Typography fontWeight="medium">
                We meet on {schedule.label}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="text"
              onClick={() => {
                setScheduleEditFieldName(field.name);
                setScheduleEditDay(schedule.day ?? 3);
                setScheduleEditTime(schedule.startTime ?? '19:00');
                setScheduleEditFrequency((schedule.frequency as any) ?? 'weekly');
                setScheduleEditOpen(true);
              }}
            >
              Change
            </Button>
          </Box>
        );
      }

      // Fallback: no schedule (edge case after auto-creation is in place)
      return (
        <Alert severity="warning" variant="outlined">
          No meeting schedule found for your MC. Contact your administrator.
        </Alert>
      );
    }

    // Fellowship member checklist
    if ((field.type === 'checkbox' || field.type === 'select') && isDynamicMemberField(field)) {
      const members = fellowshipMembers[field.name] || [];
      const isLoading = dynamicLoading[field.name];
      const memberSearchVal = memberSearch[field.name] || '';
      const selectedIds: number[] = Array.isArray(formData[field.name])
        ? formData[field.name]
        : [];
      const filtered = members.filter((m) =>
        `${m.firstName} ${m.lastName}`
          .toLowerCase()
          .includes(memberSearchVal.toLowerCase()),
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
            <Typography variant="body2" color="textSecondary">
              Loading {field.label}...
            </Typography>
          </Box>
        );
      }

      return (
        <FormControl fullWidth error={hasError} component="fieldset">
          <FormLabel component="legend">
            {field.label}
            {field.required ? ' *' : ''}
          </FormLabel>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 1 }}
          >
            {selectedIds.length} of {members.length} members selected
          </Typography>
          <TextField
            size="small"
            placeholder="Search members..."
            value={memberSearchVal}
            onChange={(e) =>
              setMemberSearch((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
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
                sx={{
                  display: 'flex',
                  mx: 0,
                  px: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              />
            ))}
            {filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                {memberSearchVal
                  ? 'No members match your search'
                  : 'No members found'}
              </Typography>
            )}
          </Box>
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
                useId ? String(g.id) === e.target.value : g.name === e.target.value,
              );
              if (selected) handleDynamicGroupChange(field, selected);
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
            // Blocks the minus key from being pressed
            onKeyDown={(e) => {
              if (e.key === '-' || e.code === 'Minus') {
                e.preventDefault();
              }
            }}
            inputProps={{ min: 0}}
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

        case 'checkbox':
          return (
            <FormControl error={hasError} required={field.required}>
              <FormLabel>{field.label}</FormLabel>
              <FormGroup>
                {Array.isArray(field.options) &&
                  field.options
                    .filter((opt): opt is string => typeof opt === 'string')
                    .map((option) => {
                      const selected = Array.isArray(value) ? value.includes(option) : false;
                      return (
                        <FormControlLabel
                          key={option}
                          control={
                            <Checkbox
                              checked={selected}
                              onChange={(e) => {
                                const current = Array.isArray(value) ? [...value] : [];
                                if (e.target.checked) {
                                  if (!current.includes(option)) current.push(option);
                                } else {
                                  const idx = current.indexOf(option);
                                  if (idx >= 0) current.splice(idx, 1);
                                }
                                handleChange(field.name, current);
                              }}
                            />
                          }
                          label={option}
                        />
                      );
                    })}
              </FormGroup>
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
      {/* Fellowship schedule edit dialog */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog
          open={scheduleEditOpen}
          onClose={() => !scheduleEditSaving && setScheduleEditOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Change Meeting Day</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Day of week</InputLabel>
                <Select
                  value={scheduleEditDay}
                  label="Day of week"
                  onChange={(e) => setScheduleEditDay(Number(e.target.value))}
                >
                  {WEEKDAY_LABELS.map((label, i) => (
                    <MenuItem key={i} value={i}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TimePicker
                label="Start time"
                ampm={false}
                value={scheduleEditTime ? dayjs(`2000-01-01T${scheduleEditTime}`) : null}
                onChange={(val) => {
                  const d = val ? dayjs(val) : null;
                  if (d?.isValid()) setScheduleEditTime(d.format('HH:mm'));
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={scheduleEditFrequency}
                  label="Frequency"
                  onChange={(e) => setScheduleEditFrequency(e.target.value as any)}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button onClick={() => setScheduleEditOpen(false)} disabled={scheduleEditSaving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleScheduleSave}
              disabled={scheduleEditSaving}
              startIcon={scheduleEditSaving ? <CircularProgress size={16} /> : null}
            >
              {scheduleEditSaving ? 'Saving…' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Container>
  );
};

export default ReportSubmissionForm;
