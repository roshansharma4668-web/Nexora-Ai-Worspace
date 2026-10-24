import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUserSession = async () => {
    // Agar Local Storage mein token nahi hai, toh backend ko request bhejne ki zaroorat nahi
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (err) {
      // Agar token expire ya invalid ho gaya hai, toh use hata dein
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
      
      // Naya Token Local Storage mein save karein
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
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
      
      // Naya Token Local Storage mein save karein
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
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
      // Logout par Token humesha Local Storage se delete karein
      localStorage.removeItem('token');
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