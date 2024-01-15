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
  MenuItem,
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
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [reportDetail, setReportDetail] = useState<string>('');
  const users = [
    {
      value: 'Frank',
      label: 'Frank',
    },
    {
      value: 'Famba',
      label: 'Famba',
    },
    {
      value: 'Marvin',
      label: 'Marvin',
    },
    {
      value: 'Joe',
      label: 'Joe',
    },
  ];

  const addTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newTask = createTask(
      newTaskName,
      newTaskDescription,
      new Date().toLocaleString(),
      assignedTo,
    );
    setTasks([...tasks, newTask]);
    setNewTaskName('');
    setNewTaskDescription('');
  };

  const handleReset = () => {
    setNewTaskName('');
    setNewTaskDescription('');
  };

  return (
    <Layout>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography variant="button" component="div">
            CREATE TASKS
          </Typography>
          <form onSubmit={addTask} autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Task Name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  placeholder="Enter Task description"
                  multiline
                  variant="outlined"
                  fullWidth
                  label="Task Description"
                  minRows={2}
                  maxRows={4}
                  required
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="username"
                  select
                  label="Assigned To (User Name)"
                  value={assignedTo}
                  variant="outlined"
                  fullWidth
                  required
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  {users.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Divider style={{ margin: '20px 0' }} />
            <Grid container spacing={2} style={{ textAlign: 'center' }}>
              <Grid item xs={6}>
                <Button type="submit" variant="contained" color="primary">
                  Submit Task
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReset}
                >
                  Reset Form
                </Button>
              </Grid>
            </Grid>
          </form>
          <Divider style={{ margin: '20px 0' }} />

          <TaskList tasks={tasks} />
        </Paper>
      </Container>
    </Layout>
  );
};

export default TaskManager;
