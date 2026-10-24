import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import api from '../services/api';
import { FolderKanban, CheckSquare, AlertCircle, Clock, Calendar, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const COLORS = ['#4f46e5', '#0ea5e9', '#d97706', '#16a34a', '#dc2626'];

export default function Dashboard() {
  const { currentWorkspace } = useWorkspace();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!currentWorkspace) return;
      try {
        setLoading(true);
        const res = await api.get(`/workspaces/${currentWorkspace._id}/analytics/overview`);
        setOverview(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [currentWorkspace]);

  if (loading) return <div className="setup-shell"><p>Loading analytics dashboard...</p></div>;

  const kpis = overview?.kpis || { totalProjects: 0, totalTasks: 0, completedTasks: 0, overdueTasks: 0 };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Workspace Dashboard</h1>
          <p>Real-time analytics and productivity metrics for {currentWorkspace?.name}</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--brand-subtle)', color: 'var(--brand-primary)' }}>
            <FolderKanban size={24} />
          </div>
          <div>
            <span className="kpi-label">Active Projects</span>
            <h3 className="kpi-value">{kpis.totalProjects}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <span className="kpi-label">Total Tasks</span>
            <h3 className="kpi-value">{kpis.totalTasks}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: 'var(--success)' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <span className="kpi-label">Completed Tasks</span>
            <h3 className="kpi-value">{kpis.completedTasks}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(220, 38, 38, 0.1)', color: 'var(--danger)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <span className="kpi-label">Overdue Tasks</span>
            <h3 className="kpi-value">{kpis.overdueTasks}</h3>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Tasks by Status</h3>
          {overview?.tasksByStatus?.length === 0 ? (
            <p className="no-data">No task data available</p>
          ) : (
            <div style={{ width: '100%', height: 260, marginTop: '16px' }}>
              <ResponsiveContainer>
                <BarChart data={overview?.tasksByStatus}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Tasks by Priority</h3>
          {overview?.tasksByPriority?.length === 0 ? (
            <p className="no-data">No priority data available</p>
          ) : (
            <div style={{ width: '100%', height: 260, marginTop: '16px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={overview?.tasksByPriority}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label
                  >
                    {overview?.tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-grid">
        <div className="section-card">
          <h3><Activity size={18} /> Recent Workspace Activity</h3>
          {overview?.recentActivities?.length === 0 ? (
            <p className="no-data">No recent activities recorded</p>
          ) : (
            <div className="activity-list">
              {overview?.recentActivities.map((act) => (
                <div key={act._id} className="activity-item">
                  <div className="activity-avatar" style={{ backgroundColor: act.actorId?.avatarColor || '#4f46e5' }}>
                    {act.actorId?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="activity-details">
                    <p><strong>{act.actorId?.name || 'User'}</strong> {act.details}</p>
                    <span className="activity-time">{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card">
          <h3><Calendar size={18} /> Upcoming Project Deadlines</h3>
          {overview?.upcomingDeadlines?.length === 0 ? (
            <p className="no-data">No upcoming deadlines</p>
          ) : (
            <div className="deadline-list">
              {overview?.upcomingDeadlines.map((proj) => (
                <div key={proj._id} className="deadline-item">
                  <div>
                    <h4>{proj.name}</h4>
                    <span className={`badge badge-${proj.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {proj.status}
                    </span>
                  </div>
                  <div className="deadline-date">
                    <Clock size={14} /> {new Date(proj.deadline).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}