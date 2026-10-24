import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://nexora-ai-worspace.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

// Har request se pehle Local Storage se token uthakar Header mein bhejega
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;