import { useState, useEffect } from 'react';
import { usersAPI, tasksAPI, dutiesAPI, statsAPI, handleAPIError } from '../services/api';

export const useDutyData = () => {
  // State for users and tasks
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // State for form data
  const [formUser, setFormUser] = useState('');
  const [formTask, setFormTask] = useState('');
  const [formTimestamp, setFormTimestamp] = useState(() => new Date().toISOString().slice(0, 16));

  // State for management forms
  const [newUserName, setNewUserName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');

  // State for chart data
  const [totalTasksPerUser, setTotalTasksPerUser] = useState([]);
  const [perUserPerDate, setPerUserPerDate] = useState([]);

  // State for date range
  const [dateRangeStart, setDateRangeStart] = useState(() =>
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10)
  );
  const [dateRangeEnd, setDateRangeEnd] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Fetch users and tasks
  const fetchUsersAndTasks = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        usersAPI.getAll(),
        tasksAPI.getAll(),
      ]);
      
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
      
      // Set default form values if available
      if (usersRes.data.length > 0 && !formUser) {
        setFormUser(usersRes.data[0]);
      }
      if (tasksRes.data.length > 0 && !formTask) {
        setFormTask(tasksRes.data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch users and tasks:', e);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const [totalRes, perDateRes] = await Promise.all([
        statsAPI.getTotalPerUser(),
        statsAPI.getPerUserPerDate(),
      ]);

      console.log('Total Tasks:', totalRes.data);
      console.log('Per User Per Date:', perDateRes.data);

      setTotalTasksPerUser(Array.isArray(totalRes.data) ? totalRes.data : []);
      setPerUserPerDate(Array.isArray(perDateRes.data) ? perDateRes.data : []);
    } catch (e) {
      alert('Failed to fetch stats');
      console.error(e);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchUsersAndTasks();
    fetchStats();
  }, []);

  // Handle duty submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dutiesAPI.add({
        user: formUser,
        task: formTask,
        timestamp: new Date(formTimestamp).toISOString(),
      });
      alert('Duty added!');
      fetchStats();
    } catch (e) {
      alert(handleAPIError(e));
      console.error(e);
    }
  };

  // Handle user addition
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.add(newUserName);
      alert('User added successfully!');
      setNewUserName('');
      fetchUsersAndTasks();
    } catch (e) {
      alert(handleAPIError(e));
      console.error(e);
    }
  };

  // Handle task addition
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.add(newTaskName);
      alert('Task added successfully!');
      setNewTaskName('');
      fetchUsersAndTasks();
    } catch (e) {
      alert(handleAPIError(e));
      console.error(e);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }
    
    try {
      await usersAPI.delete(userName);
      alert('User deleted successfully!');
      fetchUsersAndTasks();
      fetchStats();
    } catch (e) {
      alert(handleAPIError(e));
      console.error(e);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskName) => {
    if (!window.confirm(`Are you sure you want to delete task "${taskName}"?`)) {
      return;
    }
    
    try {
      await tasksAPI.delete(taskName);
      alert('Task deleted successfully!');
      fetchUsersAndTasks();
      fetchStats();
    } catch (e) {
      alert(handleAPIError(e));
      console.error(e);
    }
  };

  return {
    // Data
    users,
    tasks,
    totalTasksPerUser,
    perUserPerDate,
    
    // Form states
    formUser,
    setFormUser,
    formTask,
    setFormTask,
    formTimestamp,
    setFormTimestamp,
    newUserName,
    setNewUserName,
    newTaskName,
    setNewTaskName,
    
    // Date range
    dateRangeStart,
    setDateRangeStart,
    dateRangeEnd,
    setDateRangeEnd,
    
    // Handlers
    handleSubmit,
    handleAddUser,
    handleAddTask,
    handleDeleteUser,
    handleDeleteTask,
    
    // Utility functions
    fetchUsersAndTasks,
    fetchStats,
  };
}; 