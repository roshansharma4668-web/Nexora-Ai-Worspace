import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useTheme } from '../context/ThemeContext';
import { User, Shield, Moon, Sun, Building, Check } from 'lucide-react';
import './TasksSettings.css';

export default function Settings() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg('Settings updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Workspace & Account Settings</h1>
        <p>Manage your profile preferences and workspace configurations.</p>
      </div>

      {successMsg && <div className="success-banner"><Check size={16} /> {successMsg}</div>}

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-header">
            <User size={20} color="var(--brand-primary)" />
            <h3>My Profile</h3>
          </div>
          <form onSubmit={handleSave} className="auth-form" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue={user?.name || ''} disabled />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue={user?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" defaultValue="Workspace Member" disabled />
            </div>
          </form>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <Building size={20} color="var(--brand-primary)" />
            <h3>Active Workspace</h3>
          </div>
          <div className="ws-info-box">
            <p><strong>Name:</strong> {currentWorkspace?.name}</p>
            <p><strong>Slug:</strong> {currentWorkspace?.slug}</p>
            <p><strong>Description:</strong> {currentWorkspace?.description || 'No description provided.'}</p>
          </div>

          <div className="settings-card-header" style={{ marginTop: '24px' }}>
            {theme === 'light' ? <Sun size={20} color="var(--warning)" /> : <Moon size={20} color="var(--brand-primary)" />}
            <h3>Appearance Theme</h3>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Current Mode: <strong>{theme.toUpperCase()}</strong></span>
            <button className="btn-primary" onClick={toggleTheme}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}