import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { format, parseISO, isWithinInterval } from 'date-fns';

const API_BASE = '/api';

const users = ['Venkatesh', 'Ninad', 'Prajwal', 'Aditya'];
const tasks = ['Bathroom Cleaning', 'Bathtub Cleaning', 'Trash take out', 'Sweeping', 'Moping'];

function App() {
  const [formUser, setFormUser] = useState(users[0]);
  const [formTask, setFormTask] = useState(tasks[0]);
  const [formTimestamp, setFormTimestamp] = useState(() => new Date().toISOString().slice(0, 16));

  const [totalTasksPerUser, setTotalTasksPerUser] = useState([]);
  const [perUserPerDate, setPerUserPerDate] = useState([]);

  const [dateRangeStart, setDateRangeStart] = useState(() =>
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10)
  );
  const [dateRangeEnd, setDateRangeEnd] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const fetchStats = async () => {
    try {
      const [totalRes, perDateRes] = await Promise.all([
        axios.get(`${API_BASE}/stats/total-per-user`),
        axios.get(`${API_BASE}/stats/per-user-per-date`),
      ]);

      // Check and log data structure
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

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Roommate Duties Tracker</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 40, display: 'flex', gap: 20, alignItems: 'center' }}>
        <label>
          User:
          <select value={formUser} onChange={e => setFormUser(e.target.value)}>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>

        <label>
          Task:
          <select value={formTask} onChange={e => setFormTask(e.target.value)}>
            {tasks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label>
          Date & Time:
          <input
            type="datetime-local"
            value={formTimestamp}
            onChange={e => setFormTimestamp(e.target.value)}
          />
        </label>

        <button type="submit" style={{ padding: '6px 12px' }}>Add Duty</button>
      </form>

      <h2>Total Tasks Per User</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={totalTasksPerUser}>
          <XAxis dataKey="user" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: 50 }}>Tasks Per User Over Date Range</h2>

      <div style={{ marginBottom: 20, display: 'flex', gap: 20 }}>
        <label>
          Start Date:
          <input
            type="date"
            value={dateRangeStart}
            onChange={e => setDateRangeStart(e.target.value)}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={dateRangeEnd}
            onChange={e => setDateRangeEnd(e.target.value)}
          />
        </label>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={lineChartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {users.map(user => (
            <Line
              key={user}
              type="monotone"
              dataKey={user}
              stroke={
                user === 'Venkatesh' ? '#8884d8' :
                user === 'Ninad' ? '#82ca9d' :
                user === 'Prajwal' ? '#ffc658' :
                '#ff7300'
              }
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
