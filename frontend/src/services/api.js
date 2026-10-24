import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://nexora-ai-worspace.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// 1. Request Interceptor: Har request mein token bhejega
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Login/Register hote hi token AUTOMATICALLY save karega!
api.interceptors.response.use(
  (response) => {
    const token = response?.data?.token || response?.data?.data?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;