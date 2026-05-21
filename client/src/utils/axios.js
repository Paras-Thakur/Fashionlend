import axios from 'axios';

// Prefer CRA-style env var, fall back to plain BACKEND_URL if present
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || process.env.BACKEND_URL || '';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: false,
});

// Attach Authorization header from localStorage automatically
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Preserve any explicitly set header
      if (!config.headers) config.headers = {};
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (_) {
    // no-op
  }
  return config;
});

export default axiosInstance;


