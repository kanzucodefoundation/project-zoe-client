// src/App.tsx
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Layout from '../layout/Layout';

import TaskList from './TaskList';
import TaskAssignmentList from './TaskAssignmentList';
import TaskReportList from './TaskReportList';
import StatusList from './StatusList';
import StatusChangeLogList from './StatusChangeLogList';
import {
  createTask,
  Task,
  createTaskAssignment,
  TaskAssignment,
  createTaskReport,
  TaskReport,
  Status,
  createStatusChangeLog,
  StatusChangeLog,
} from './models';
import {
  Container,
  CssBaseline,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Theme,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontWeight: 500,
  },
}));

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [taskReports, setTaskReports] = useState<TaskReport[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [statusChangeLogs, setStatusChangeLogs] = useState<StatusChangeLog[]>(
    [],
  );
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [reportDetail, setReportDetail] = useState<string>('');
  const [userStatus, setUserStatus] = useState<string>('');
  const classes = useStyles();

  const addTask = () => {
    const newTask = createTask(
      newTaskName,
      newTaskDescription,
      new Date(),
      true,
      new Date(),
    );
    setTasks([...tasks, newTask]);
    setNewTaskName('');
    setNewTaskDescription('');
  };

  const addTaskAssignment = () => {
    if (tasks.length === 0) {
      alert('No tasks available to assign.');
      return;
    }

    const taskIndex = Math.floor(Math.random() * tasks.length);
    const assignedTask = tasks[taskIndex];

    const newTaskAssignment = createTaskAssignment(
      assignedTo,
      assignedTask.id,
      new Date(),
      new Date(),
    );
    setTaskAssignments([...taskAssignments, newTaskAssignment]);
    setAssignedTo('');
  };

  const submitTaskReport = () => {
    if (taskAssignments.length === 0) {
      alert('No task assignments available to submit a report.');
      return;
    }

    const assignmentIndex = Math.floor(Math.random() * taskAssignments.length);
    const assignedTaskAssignment = taskAssignments[assignmentIndex];

    const newTaskReport = createTaskReport(
      assignedTaskAssignment.assignedTo,
      assignedTaskAssignment.taskId,
      reportDetail,
      'attachment.pdf',
      new Date(),
    );
    setTaskReports([...taskReports, newTaskReport]);
    setReportDetail('');
  };

  const updateUserStatus = () => {
    const newStatus = createStatusChangeLog(
      'user1',
      statuses[statuses.length - 1]?.name || 'Initial Status',
      userStatus,
      new Date(),
    );
    setStatusChangeLogs([...statusChangeLogs, newStatus]);
    setUserStatus('');
  };

  return (
    <Layout>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography variant="button" component="div">
            TASK MANAGEMENT
          </Typography>
          {/* Task creation form */}
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
            variant="body2"
          >
            ADD TASK
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                fullWidth
                label="Task Name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                fullWidth
                label="Task Description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button variant="contained" color="primary" onClick={addTask}>
                Add Task
              </Button>
            </Grid>
          </Grid>
          <Divider style={{ margin: '20px 0' }} />

          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
            variant="body2"
          >
            ASSIGN TASK
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                fullWidth
                label="Assigned To (User ID)"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={addTaskAssignment}
              >
                Assign Task
              </Button>
            </Grid>
          </Grid>
          <Divider style={{ margin: '20px 0' }} />

          {/* Task Report form */}
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
            variant="body2"
          >
            SUBMIT TASK REPORT
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                fullWidth
                label="Report Detail"
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={submitTaskReport}
              >
                Submit Report
              </Button>
            </Grid>
          </Grid>
          <Divider style={{ margin: '20px 0' }} />

          {/* Update User Status form */}
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
            variant="body2"
          >
            UPDATE USER STATUS
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                variant="outlined"
                fullWidth
                label="New Status"
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={updateUserStatus}
              >
                Update Status
              </Button>
            </Grid>
          </Grid>

          {/* Display other components */}
          <TaskList tasks={tasks} />
          <TaskAssignmentList taskAssignments={taskAssignments} />
          <TaskReportList taskReports={taskReports} />
          <StatusList statuses={statuses} />
          <StatusChangeLogList statusChangeLogs={statusChangeLogs} />
        </Paper>
      </Container>
    </Layout>
  );
};

export default TaskManager;
