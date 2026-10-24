import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUserSession = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      const token = response.data?.token || response.data?.data?.token;
      
      if (token) {
        localStorage.setItem('token', token);
      }
      
      setUser(response.data.data.user);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      const token = response.data?.token || response.data?.data?.token;
      
      if (token) {
        localStorage.setItem('token', token);
      }
      
      setUser(response.data.data.user);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('nexora_active_workspace');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, checkUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);