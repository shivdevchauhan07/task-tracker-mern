import axios from 'axios';

const API = axios.create({
  baseURL: 'https://taskflow-shivdev.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const taskAPI = {
  getAll: (params) => API.get('/tasks', { params }),
  getById: (id) => API.get(`/tasks/${id}`),
  create: (data) => API.post('/tasks', data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
  getStats: () => API.get('/tasks/stats')
};

export default API;