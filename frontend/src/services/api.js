import axios from 'axios';

const API_BASE = "http://localhost:10000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  add: (name) => api.post('/users', { name }),
  delete: (name) => api.delete(`/users/${encodeURIComponent(name)}`),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  add: (name) => api.post('/tasks', { name }),
  delete: (name) => api.delete(`/tasks/${encodeURIComponent(name)}`),
};

// Duties API
export const dutiesAPI = {
  add: (duty) => api.post('/add-duty', duty),
  getAll: () => api.get('/get-duties'),
};

// Stats API
export const statsAPI = {
  getTotalPerUser: () => api.get('/stats/total-per-user'),
  getPerUserPerDate: () => api.get('/stats/per-user-per-date'),
};

// Error handler
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return 'An unexpected error occurred.';
  }
};

export default api; 