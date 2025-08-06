import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { format, parseISO, isWithinInterval } from 'date-fns';
import './App.css';

const API_BASE = "http://localhost:10000/api";

function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  
  // Dynamic data from API
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Form states
  const [formUser, setFormUser] = useState('');
  const [formTask, setFormTask] = useState('');
  const [formTimestamp, setFormTimestamp] = useState(() => new Date().toISOString().slice(0, 16));

  // Management form states
  const [newUserName, setNewUserName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');

  // Chart data
  const [totalTasksPerUser, setTotalTasksPerUser] = useState([]);
  const [perUserPerDate, setPerUserPerDate] = useState([]);

  // Date range for charts
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
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/tasks`),
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

  const fetchStats = async () => {
    try {
      const [totalRes, perDateRes] = await Promise.all([
        axios.get(`${API_BASE}/stats/total-per-user`),
        axios.get(`${API_BASE}/stats/per-user-per-date`),
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

  useEffect(() => {
    fetchUsersAndTasks();
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/add-duty`, {
        user: formUser,
        task: formTask,
        timestamp: new Date(formTimestamp).toISOString(),
      });
      alert('Duty added!');
      fetchStats();
    } catch (e) {
      alert('Failed to add duty');
      console.error(e);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/users`, { name: newUserName });
      alert('User added successfully!');
      setNewUserName('');
      fetchUsersAndTasks();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to add user');
      console.error(e);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/tasks`, { name: newTaskName });
      alert('Task added successfully!');
      setNewTaskName('');
      fetchUsersAndTasks();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to add task');
      console.error(e);
    }
  };

  const handleDeleteUser = async (userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE}/users/${encodeURIComponent(userName)}`);
      alert('User deleted successfully!');
      fetchUsersAndTasks();
      fetchStats();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete user');
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskName) => {
    if (!window.confirm(`Are you sure you want to delete task "${taskName}"?`)) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE}/tasks/${encodeURIComponent(taskName)}`);
      alert('Task deleted successfully!');
      fetchUsersAndTasks();
      fetchStats();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete task');
      console.error(e);
    }
  };

  const filteredLineData = Array.isArray(perUserPerDate)
    ? perUserPerDate.filter((entry) => {
        const entryDate = parseISO(entry.date);
        return isWithinInterval(entryDate, {
          start: parseISO(dateRangeStart),
          end: parseISO(dateRangeEnd),
        });
      })
    : [];

  const datesSet = new Set(filteredLineData.map(d => d.date));
  const datesSorted = Array.from(datesSet).sort();

  const lineChartData = datesSorted.map(date => {
    const point = { date };
    users.forEach(user => {
      const entry = filteredLineData.find(d => d.date === date && d.user === user);
      point[user] = entry ? entry.count : 0;
    });
    return point;
  });

  const renderTrackerTab = () => (
    <div className="fade-in">
      <div className="card duty-form">
        <div className="card-header">
          <h2>Add New Duty</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">User:</label>
              <select 
                className="form-select" 
                value={formUser} 
                onChange={e => setFormUser(e.target.value)}
              >
                {users.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Task:</label>
              <select 
                className="form-select" 
                value={formTask} 
                onChange={e => setFormTask(e.target.value)}
              >
                {tasks.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date & Time:</label>
              <input
                className="form-control"
                type="datetime-local"
                value={formTimestamp}
                onChange={e => setFormTimestamp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">Add Duty</button>
            </div>
          </div>
        </form>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-title">Total Tasks Per User</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={totalTasksPerUser}>
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Tasks Per User Over Date Range</div>
          
          <div className="date-range-controls">
            <div className="form-group">
              <label className="form-label">Start Date:</label>
              <input
                className="form-control"
                type="date"
                value={dateRangeStart}
                onChange={e => setDateRangeStart(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date:</label>
              <input
                className="form-control"
                type="date"
                value={dateRangeEnd}
                onChange={e => setDateRangeEnd(e.target.value)}
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {users.map((user, index) => (
                <Line
                  key={user}
                  type="monotone"
                  dataKey={user}
                  stroke={
                    index === 0 ? '#667eea' :
                    index === 1 ? '#82ca9d' :
                    index === 2 ? '#ffc658' :
                    index === 3 ? '#ff7300' :
                    `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                  }
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderManagementTab = () => (
    <div className="fade-in">
      <div className="management-grid">
        {/* Users Management */}
        <div className="card">
          <div className="card-header">
            <h2>Users Management</h2>
          </div>
          
          <form onSubmit={handleAddUser} className="form-group">
            <div className="form-row">
              <div className="form-group">
                <input
                  className="form-control"
                  type="text"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="Enter user name"
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-success">Add User</button>
              </div>
            </div>
          </form>
          
          <div>
            <h3>Current Users:</h3>
            {users.map(user => (
              <div key={user} className="list-item">
                <span className="list-item-name">{user}</span>
                <button 
                  onClick={() => handleDeleteUser(user)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Management */}
        <div className="card">
          <div className="card-header">
            <h2>Tasks Management</h2>
          </div>
          
          <form onSubmit={handleAddTask} className="form-group">
            <div className="form-row">
              <div className="form-group">
                <input
                  className="form-control"
                  type="text"
                  value={newTaskName}
                  onChange={e => setNewTaskName(e.target.value)}
                  placeholder="Enter task name"
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-success">Add Task</button>
              </div>
            </div>
          </form>
          
          <div>
            <h3>Current Tasks:</h3>
            {tasks.map(task => (
              <div key={task} className="list-item">
                <span className="list-item-name">{task}</span>
                <button 
                  onClick={() => handleDeleteTask(task)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="app-header">
        <h1>Roommate Duties Tracker</h1>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          Duty Tracker
        </button>
        <button
          className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          Manage Users & Tasks
        </button>
      </div>

      {activeTab === 'tracker' ? renderTrackerTab() : renderManagementTab()}
    </div>
  );
}

export default App;
