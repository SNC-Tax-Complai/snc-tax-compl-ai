import axios from 'axios';

// Runtime config (public/config.js) takes precedence over build-time env var.
// This allows changing the backend URL with a git push — no app rebuild needed.
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.COMPL_AI_CONFIG?.apiUrl) {
    return window.COMPL_AI_CONFIG.apiUrl;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
