import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/workspaces');
      const list = response.data.data.workspaces;
      setWorkspaces(list);

      if (list.length > 0) {
        const savedId = localStorage.getItem('nexora_active_workspace');
        const active = list.find((w) => w._id === savedId) || list[0];
        setCurrentWorkspace(active);
        localStorage.setItem('nexora_active_workspace', active._id);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const switchWorkspace = (workspaceId) => {
    const found = workspaces.find((w) => w._id === workspaceId);
    if (found) {
      setCurrentWorkspace(found);
      localStorage.setItem('nexora_active_workspace', found._id);
    }
  };

  const createWorkspace = async (workspaceData) => {
    const response = await api.post('/workspaces', workspaceData);
    const newWs = response.data.data.workspace;
    setWorkspaces((prev) => [...prev, { ...newWs, role: 'owner' }]);
    setCurrentWorkspace(newWs);
    localStorage.setItem('nexora_active_workspace', newWs._id);
    return newWs;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        switchWorkspace,
        createWorkspace,
        fetchWorkspaces
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);