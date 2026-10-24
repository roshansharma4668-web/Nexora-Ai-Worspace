import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import api from '../services/api';
import { CheckSquare, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import './TasksSettings.css';

export default function MyTasks() {
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchMyTasks = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${currentWorkspace._id}/tasks/my-tasks`);
      setTasks(res.data.data.tasks);
    } catch (err) {
      console.error('Failed to load assigned tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [currentWorkspace]);

  const handleStatusChange = async (taskId, projectId, newStatus) => {
    try {
      await api.patch(`/workspaces/${currentWorkspace._id}/projects/${projectId}/tasks/${taskId}/move`, {
        status: newStatus
      });
      fetchMyTasks();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>My Assigned Tasks</h1>
          <p>Tasks assigned to you across all projects in {currentWorkspace?.name}</p>
        </div>
        <div className="filter-tabs">
          {['All', 'Todo', 'In Progress', 'In Review', 'Completed'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading your tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={48} color="var(--text-muted)" />
          <h3>No tasks found</h3>
          <p>You have no tasks matching the selected filter in this workspace.</p>
        </div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task) => (
            <div key={task._id} className="task-row-card">
              <div className="task-row-left">
                <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
                <div>
                  <h4>{task.title}</h4>
                  <p className="task-proj-name">Project: <strong>{task.projectId?.name || 'General'}</strong></p>
                </div>
              </div>

              <div className="task-row-right">
                <span className="task-due">
                  <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString()}
                </span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, task.projectId?._id, e.target.value)}
                  className="status-dropdown-pill"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}