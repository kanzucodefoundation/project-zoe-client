import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Collapse,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { get, put, post, del } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';

interface IReport {
  id: number;
  name: string;
  description?: string;
  status: string;
  active: boolean;
  submissionFrequency?: string | { id: number; name: string };
  viewType?: string | { id: number; name: string };
  targetGroupCategory?: string | { id: number; name: string } | null;
  fieldCount?: number;
  fields?: any[];
}

const emptyReportTemplate = {
  name: '',
  description: '',
  submissionFrequency: 'weekly',
  viewType: 'table',
  status: 'ACTIVE',
  active: true,
  targetGroupCategory: null,
  groupFieldName: null,
  functionName: null,
  displayColumns: {},
  footer: [],
  fields: [],
};

const ReportConfiguration = () => {
  const [activeReports, setActiveReports] = useState<IReport[]>([]);
  const [inactiveReports, setInactiveReports] = useState<IReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionMenuReport, setActionMenuReport] = useState<IReport | null>(null);
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchReports = () => {
    setIsLoading(true);
    get(
      remoteRoutes.reports,
      (response: any) => {
        const reports: IReport[] = Array.isArray(response) ? response : response?.reports || [];
        const active = reports.filter((r) => r.status === 'ACTIVE' && r.active === true);
        const inactive = reports.filter((r) => r.status !== 'ACTIVE' || r.active !== true);
        setActiveReports(active);
        setInactiveReports(inactive);
        setIsLoading(false);
      },
      (error: any) => {
        console.error('Failed to fetch reports:', error);
        toast.error('Failed to load reports');
        setIsLoading(false);
      },
    );
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, report: IReport) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActionMenuReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionMenuReport(null);
  };

  const handleNewReport = () => {
    setSelectedReport(null);
    setJsonValue(JSON.stringify(emptyReportTemplate, null, 2));
    setJsonError(null);
    setIsModalOpen(true);
  };

  const handleEditReport = () => {
    if (!actionMenuReport) return;
    handleMenuClose();

    get(
      `${remoteRoutes.reports}/${actionMenuReport.id}`,
      (response: any) => {
        setSelectedReport(response);
        setJsonValue(JSON.stringify(response, null, 2));
        setJsonError(null);
        setIsModalOpen(true);
      },
      (error: any) => {
        console.error('Failed to fetch report details:', error);
        toast.error('Failed to load report details');
      },
    );
  };

  const handleToggleStatus = () => {
    if (!actionMenuReport) return;
    const report = actionMenuReport;
    handleMenuClose();

    const isCurrentlyActive = report.status === 'ACTIVE' && report.active === true;
    const newData = {
      status: isCurrentlyActive ? 'INACTIVE' : 'ACTIVE',
      active: !isCurrentlyActive,
    };

    put(
      `${remoteRoutes.reports}/${report.id}`,
      newData,
      () => {
        toast.success(`Report ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully`);
        fetchReports();
      },
      (error: any) => {
        console.error('Failed to toggle report status:', error);
        toast.error('Failed to update report status');
      },
    );
  };

  const handleDeleteReport = () => {
    if (!actionMenuReport) return;
    const report = actionMenuReport;
    handleMenuClose();

    if (!window.confirm(`Are you sure you want to delete "${report.name}"? This action cannot be undone.`)) {
      return;
    }

    del(
      `${remoteRoutes.reports}/${report.id}`,
      () => {
        toast.success('Report deleted successfully');
        fetchReports();
      },
      (error: any) => {
        console.error('Failed to delete report:', error);
        const message = error?.response?.data?.message || 'Cannot delete report. It may have existing submissions.';
        toast.error(message);
      },
    );
  };

  const handleSaveReport = () => {
    setJsonError(null);

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonValue);
    } catch (e: any) {
      setJsonError(`Invalid JSON format: ${e.message}`);
      return;
    }

    setIsSaving(true);

    if (selectedReport?.id) {
      put(
        `${remoteRoutes.reports}/${selectedReport.id}`,
        parsedData,
        () => {
          toast.success('Report updated successfully');
          setIsModalOpen(false);
          setSelectedReport(null);
          setIsSaving(false);
          fetchReports();
        },
        (error: any) => {
          console.error('Failed to update report:', error);
          const message = error?.response?.data?.message || 'Failed to update report';
          toast.error(message);
          setIsSaving(false);
        },
      );
    } else {
      post(
        remoteRoutes.reports,
        parsedData,
        () => {
          toast.success('Report created successfully');
          setIsModalOpen(false);
          setSelectedReport(null);
          setIsSaving(false);
          fetchReports();
        },
        (error: any) => {
          console.error('Failed to create report:', error);
          const message = error?.response?.data?.message || 'Failed to create report';
          toast.error(message);
          setIsSaving(false);
        },
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setJsonValue('');
    setJsonError(null);
  };

  const capitalize = (str?: string) => {
    if (!str) return '-';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const renderReportsTable = (reports: IReport[], isInactive = false) => {
    if (reports.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            {isInactive ? 'No inactive reports' : 'No reports configured. Create your first report!'}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{backgroundColor: isInactive ? 'action.hover' : 'background.paper' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: isInactive ? 'action.selected' : 'action.hover',
                '& .MuiTableCell-root': {
                  color: isInactive ? 'text.secondary' : 'text.primary',
                },
              }}
            >              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Frequency</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>View Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fields</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id} hover>
                <TableCell>
                  <Typography fontWeight="bold">{report.name}</Typography>
                  {report.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {report.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {report.targetGroupCategory ? (
                    <Chip
                      label={
                        typeof report.targetGroupCategory === 'object'
                          ? (report.targetGroupCategory as any).name
                          : report.targetGroupCategory
                      }
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">Church-wide</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {capitalize(
                    typeof report.submissionFrequency === 'object'
                      ? (report.submissionFrequency as any)?.name
                      : report.submissionFrequency
                  )}
                </TableCell>
                <TableCell>
                  {capitalize(
                    typeof report.viewType === 'object'
                      ? (report.viewType as any)?.name
                      : report.viewType
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {report.fieldCount ?? report.fields?.length ?? 0} fields
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, report)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4">Report Configuration</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage report templates and fields
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewReport}
          sx={{ textTransform: 'none' }}
        >
          New Report
        </Button>
      </Box>

      {/* Active Reports Section */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Active Reports
      </Typography>
      {renderReportsTable(activeReports)}

      {/* Inactive Reports Section */}
      {inactiveReports.length > 0 && (
        <Box mt={4}>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              cursor: 'pointer',
              py: 1,
              px: 2,
              backgroundColor: 'action.selected',
              borderRadius: 1,
              mb: showInactive ? 2 : 0,
            }}
            onClick={() => setShowInactive(!showInactive)}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
              Inactive Reports ({inactiveReports.length})
            </Typography>
            {showInactive ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          <Collapse in={showInactive}>
            {renderReportsTable(inactiveReports, true)}
          </Collapse>
        </Box>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditReport}>Edit Report</MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          {actionMenuReport?.status === 'ACTIVE' && actionMenuReport?.active ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={handleDeleteReport} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Edit/Create Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedReport ? `Edit Report: ${selectedReport.name}` : 'Create New Report'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={jsonValue}
            onChange={(e) => {
              setJsonValue(e.target.value);
              setJsonError(null);
            }}
            placeholder="Enter report JSON..."
            sx={{
              mt: 1,
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
            error={!!jsonError}
          />
          {jsonError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {jsonError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveReport}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportConfiguration;
