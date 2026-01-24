import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
  Button,
} from '@mui/material';
import {
  People,
  Group,
  Assignment,
  TrendingUp,
  TrendingDown,
  Warning,
  Event,
  Send,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../data/store';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

interface DashboardData {
  overview: {
    totalGroups: number;
    totalMembers: number;
    reportsSubmitted: number;
    reportsOverdue: number;
  };
  thisWeek: {
    attendance: number;
    visitors: number;
    newMembers: number;
    salvations: number;
    baptisms: number;
  };
  lastWeek: {
    attendance: number;
    visitors: number;
    newMembers: number;
    salvations: number;
    baptisms: number;
  };
  trend: {
    attendanceChange: number;
    visitorsChange: number;
  };
  group: {
    id: number;
    name: string;
    type: string;
    memberCount: number;
    activeMembers: number;
  } | null;
  pendingReports: string[];
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    userId: number;
    reportId: number;
  }>;
  upcomingDeadlines: Array<{
    type: string;
    title: string;
    dueDate: string;
    groupsCount: number;
  }>;
}

const StatCard = ({ title, value, icon, trend }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
}) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="h2">
            {value}
          </Typography>
          {trend !== undefined && (
            <Box display="flex" alignItems="center" mt={1}>
              {trend > 0 ? <TrendingUp color="success" /> : trend < 0 ? <TrendingDown color="error" /> : null}
              <Typography variant="body2" color={trend > 0 ? "success.main" : trend < 0 ? "error.main" : "textSecondary"}>
                {trend > 0 ? '+' : ''}{trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Box color="primary.main">
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

interface IReport {
  id: number;
  name: string;
  fieldCount?: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [reports, setReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.core);

  useEffect(() => {
    get(
      remoteRoutes.dashboardSummary,
      (response) => {
        setData(response);
        setLoading(false);
      },
      (error) => {
        console.error('Dashboard API Error:', error);
        setLoading(false);
      }
    );

    get(
      remoteRoutes.reports,
      (response: any) => {
        setReports(response.reports || []);
      },
      (error: any) => {
        console.error('Failed to fetch reports:', error);
      }
    );
  }, []);

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Loading Dashboard...
        </Typography>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography>Failed to load dashboard data</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.fullName || user?.username || 'User'}
        </Typography>
        {reports.filter((r) => r.fieldCount && r.fieldCount > 0).length > 0 && (
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5} mt={1}>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mr: 1 }}>
              Submit Report:
            </Typography>
            {reports
              .filter((r) => r.fieldCount && r.fieldCount > 0)
              .map((report) => (
                <Button
                  key={report.id}
                  variant="contained"
                  startIcon={<Send />}
                  onClick={() => navigate(`/reports/${report.id}/submit`)}
                  sx={{
                    backgroundColor: '#1b813e',
                    '&:hover': { backgroundColor: '#15662f' },
                    fontWeight: 'bold',
                  }}
                >
                  {report.name}
                </Button>
              ))}
          </Box>
        )}
      </Box>

      {/* Overview Stats */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
        gap={3} 
        sx={{ mb: 4 }}
      >
        <StatCard
          title="Total Groups"
          value={data.overview.totalGroups}
          icon={<Group fontSize="large" />}
        />
        <StatCard
          title="Total Members"
          value={data.overview.totalMembers}
          icon={<People fontSize="large" />}
        />
        <StatCard
          title="Reports Submitted"
          value={data.overview.reportsSubmitted}
          icon={<Assignment fontSize="large" />}
        />
        <StatCard
          title="Reports Overdue"
          value={data.overview.reportsOverdue}
          icon={<Warning fontSize="large" />}
        />
      </Box>

      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        gap={3}
        sx={{ mb: 4 }}
      >
        {/* This Week vs Last Week */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weekly Comparison
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  This Week
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={1}>
                  <People />
                  <Typography variant="h5">{data.thisWeek.attendance}</Typography>
                </Box>
                <Typography variant="body2">Attendance</Typography>
                
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Visitors: {data.thisWeek.visitors} | New: {data.thisWeek.newMembers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Salvations: {data.thisWeek.salvations} | Baptisms: {data.thisWeek.baptisms}
                  </Typography>
                </Box>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Week
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={1}>
                  <People />
                  <Typography variant="h5">{data.lastWeek.attendance}</Typography>
                </Box>
                <Typography variant="body2">Attendance</Typography>
                
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Visitors: {data.lastWeek.visitors} | New: {data.lastWeek.newMembers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Salvations: {data.lastWeek.salvations} | Baptisms: {data.lastWeek.baptisms}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </CardContent>
        </Card>

        {/* Group Information */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Group
            </Typography>
            {data.group ? (
              <>
                <Typography variant="h5" color="primary">
                  {data.group.name}
                </Typography>
                <Chip label={data.group.type} size="small" sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Box textAlign="center">
                    <Typography variant="h6">{data.group.memberCount}</Typography>
                    <Typography variant="body2" color="textSecondary">Total Members</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6">{data.group.activeMembers}</Typography>
                    <Typography variant="body2" color="textSecondary">Active Members</Typography>
                  </Box>
                </Box>
              </>
            ) : (
              <Typography color="textSecondary">No group assigned</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        gap={3}
        sx={{ mb: 4 }}
      >
        {/* Pending Reports */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Reports
            </Typography>
            {data.pendingReports.length > 0 ? (
              <List dense>
                {data.pendingReports.map((report, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Assignment color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={report} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No pending reports</Typography>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List dense>
              {data.recentActivity.map((activity, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={activity.description}
                    secondary={new Date(activity.timestamp).toLocaleDateString()}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Upcoming Deadlines */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upcoming Deadlines
          </Typography>
          <List>
            {data.upcomingDeadlines.map((deadline, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Event color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary={deadline.title}
                  secondary={`Due: ${new Date(deadline.dueDate).toLocaleDateString()} (${deadline.groupsCount} group${deadline.groupsCount !== 1 ? 's' : ''})`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;