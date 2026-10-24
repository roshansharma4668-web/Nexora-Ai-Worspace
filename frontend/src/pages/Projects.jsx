import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import api from '../services/api';
import { Plus, FolderKanban, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Projects.css';

export default function Projects() {
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    deadline: ''
  });
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${currentWorkspace._id}/projects`);
      setProjects(res.data.data.projects);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentWorkspace]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/workspaces/${currentWorkspace._id}/projects`, formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', status: 'Planning', priority: 'Medium', deadline: '' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>Manage and track progress across your workspace initiatives.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={48} color="var(--text-muted)" />
          <h3>No projects found</h3>
          <p>Get started by creating your first project in this workspace.</p>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ marginTop: '16px' }}>
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} className="project-card">
              <div className="project-card-top">
                <h3>{p.name}</h3>
                <span className={`badge badge-${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {p.status}
                </span>
              </div>
              <p className="project-desc">{p.description || 'No description provided.'}</p>
              <div className="project-card-footer">
                <span className="priority">Priority: <strong>{p.priority}</strong></span>
                <span className="deadline">
                  <Calendar size={14} /> {new Date(p.deadline).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Create New Project</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleCreate} className="auth-form" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Q4 Website Redesign"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of project goals..."
                  style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Deadline *</label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="auth-submit-btn" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="auth-submit-btn" style={{ margin: 0 }}>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}