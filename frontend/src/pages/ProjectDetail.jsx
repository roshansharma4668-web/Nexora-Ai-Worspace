import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import api from '../services/api';
import { ArrowLeft, Sparkles } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import AIAssistantModal from '../components/AIAssistantModal';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { currentWorkspace } = useWorkspace();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProject = async () => {
    if (!currentWorkspace) return;
    try {
      const res = await api.get(`/workspaces/${currentWorkspace._id}/projects/${projectId}`);
      setProject(res.data.data.project);
    } catch (err) {
      console.error('Failed to load project details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [currentWorkspace, projectId]);

  if (loading) return <div className="setup-shell"><p>Loading project...</p></div>;
  if (!project) return <div className="setup-shell"><p>Project not found.</p></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => navigate('/projects')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <button className="btn-primary" onClick={() => setIsAiModalOpen(true)} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' }}>
          <Sparkles size={16} /> Ask AI Assistant
        </button>
      </div>

      <div className="setup-card" style={{ maxWidth: '100%', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>{project.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{project.description || 'No description provided.'}</p>
          </div>
          <span className={`badge badge-${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
            {project.status}
          </span>
        </div>
      </div>

      <KanbanBoard />

      {isAiModalOpen && (
        <AIAssistantModal
          workspaceId={currentWorkspace._id}
          projectId={projectId}
          onClose={() => setIsAiModalOpen(false)}
          onTasksAdded={() => window.location.reload()}
        />
      )}
    </div>
  );
}