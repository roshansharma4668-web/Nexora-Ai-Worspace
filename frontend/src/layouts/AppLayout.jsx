import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, LogOut, Sun, Moon, Sparkles } from 'lucide-react';
import './AppLayout.css';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <Sparkles className="brand-icon" size={22} />
          <span className="brand-text">Nexora</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/projects" className="nav-item">
            <FolderKanban size={18} />
            <span>Projects</span>
          </Link>
          <Link to="/tasks" className="nav-item">
            <CheckSquare size={18} />
            <span>My Tasks</span>
          </Link>
          <Link to="/settings" className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" style={{ backgroundColor: user?.avatarColor || '#4f46e5' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || 'User'}</p>
              <p className="user-email">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div className="app-main-wrapper">
        <header className="app-topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">Workspace Portal</h2>
          </div>
          <div className="topbar-right">
            <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}