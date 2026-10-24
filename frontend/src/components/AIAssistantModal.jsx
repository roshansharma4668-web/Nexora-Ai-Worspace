import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, Bot } from 'lucide-react';
import api from '../services/api';
import './AIAssistant.css';

export default function AIAssistantModal({ workspaceId, projectId, onClose, onTasksAdded }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/ai/generate-plan`, { description });
      setSuggestedTasks(res.data.data.suggestedTasks);
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed. Check your GEMINI_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      await api.post(`/workspaces/${workspaceId}/ai/projects/${projectId}/confirm-tasks`, {
        tasks: suggestedTasks
      });
      onTasksAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save AI tasks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="ai-modal-card">
        <div className="ai-modal-header">
          <div className="ai-title-wrap">
            <Bot size={22} color="var(--brand-primary)" />
            <h2>Nexora AI Project Assistant</h2>
          </div>
          <button onClick={onClose} className="close-btn"><X size={18} /></button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {suggestedTasks.length === 0 ? (
          <form onSubmit={handleGenerate} className="auth-form" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label>Describe your project goals or scope *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Build a real-time collaborative chat application with Node.js and React..."
                style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <><Loader2 className="spinner" size={18} /> Generating Plan...</> : <><Sparkles size={18} /> Generate AI Task Breakdown</>}
            </button>
          </form>
        ) : (
          <div className="ai-preview-container">
            <h3 className="preview-heading">Review Suggested Tasks ({suggestedTasks.length})</h3>
            <div className="ai-tasks-list">
              {suggestedTasks.map((t, idx) => (
                <div key={idx} className="ai-task-preview-item">
                  <div className="ai-task-top">
                    <h4>{t.title}</h4>
                    <span className={`priority-pill priority-${t.priority?.toLowerCase() || 'medium'}`}>
                      {t.priority || 'Medium'}
                    </span>
                  </div>
                  <p>{t.description}</p>
                  <span className="est-hours">Est. {t.estimatedHours || 4} hours</span>
                </div>
              ))}
            </div>

            <div className="ai-modal-actions">
              <button className="auth-submit-btn" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }} onClick={() => setSuggestedTasks([])}>
                Try Different Prompt
              </button>
              <button className="auth-submit-btn" onClick={handleConfirmSave} disabled={saving} style={{ margin: 0 }}>
                {saving ? 'Adding Tasks...' : <><Check size={18} /> Confirm & Add to Project</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}