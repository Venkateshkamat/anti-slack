import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { parseISO, isWithinInterval } from 'date-fns';

const DutyTracker = ({ 
  users, 
  tasks, 
  formUser, 
  setFormUser, 
  formTask, 
  setFormTask, 
  formTimestamp, 
  setFormTimestamp,
  handleSubmit,
  totalTasksPerUser,
  perUserPerDate,
  dateRangeStart,
  setDateRangeStart,
  dateRangeEnd,
  setDateRangeEnd
}) => {
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
};

export default DutyTracker; 