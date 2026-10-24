import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import api from '../services/api';
import { socket } from '../services/socket';
import { Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import './Kanban.css';

const COLUMNS = ['Todo', 'In Progress', 'In Review', 'Completed'];

export default function KanbanBoard() {
  const { projectId } = useParams();
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: ''
  });
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${currentWorkspace._id}/projects/${projectId}/tasks`);
      setTasks(res.data.data.tasks);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Join Socket.IO project room
    socket.emit('join-project', projectId);

    // Listen for real-time task additions from other clients
    socket.on('task-added', (newTask) => {
      setTasks((prev) => [newTask, ...prev]);
    });

    // Listen for real-time task updates/moves from other clients
    socket.on('task-updated', (updatedTask) => {
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    });

    return () => {
      socket.emit('leave-project', projectId);
      socket.off('task-added');
      socket.off('task-updated');
    };
  }, [currentWorkspace, projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post(`/workspaces/${currentWorkspace._id}/projects/${projectId}/tasks`, formData);
      const newTask = res.data.data.task;
      setTasks((prev) => [newTask, ...prev]);
      
      // Emit socket event for real-time broadcast
      socket.emit('new-task-created', { projectId, task: newTask });

      setIsModalOpen(false);
      setFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/workspaces/${currentWorkspace._id}/projects/${projectId}/tasks/${taskId}/move`, {
        status: newStatus
      });
      const updatedTask = res.data.data.task;
      setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));

      // Emit socket event for real-time broadcast
      socket.emit('task-update', { projectId, task: updatedTask });
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div>
          <h2>Project Kanban Board</h2>
          <p>Real-time collaborative workflow management.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {loading ? (
        <p>Loading board...</p>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="kanban-column">
                <div className="column-header">
                  <h3>{col}</h3>
                  <span className="task-count">{colTasks.length}</span>
                </div>

                <div className="column-body">
                  {colTasks.map((task) => (
                    <div key={task._id} className="task-card">
                      <div className="task-card-header">
                        <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="status-dropdown"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <h4>{task.title}</h4>
                      <p>{task.description || 'No description'}</p>
                      <div className="task-card-footer">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        <div className="assignee-avatar" style={{ backgroundColor: task.assigneeId?.avatarColor || '#4f46e5' }}>
                          {task.assigneeId?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Create New Task</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleCreateTask} className="auth-form" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Real-time chat sync"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task details..."
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
                    {COLUMNS.map((c) => <option key={c} value={c}>{c}</option>)}
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
                <label>Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="auth-submit-btn" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="auth-submit-btn" style={{ margin: 0 }}>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}