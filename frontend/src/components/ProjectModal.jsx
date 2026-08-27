import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { X } from 'lucide-react';

const COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Green
  '#ec4899', // Pink
  '#f59e0b', // Yellow
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

const ProjectModal = ({ onClose, editingProject }) => {
  const { createProject, updateProject } = useProjects();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title);
      setDescription(editingProject.description || '');
      setColor(editingProject.color || COLORS[0]);
    } else {
      setTitle('');
      setDescription('');
      setColor(COLORS[0]);
    }
  }, [editingProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Proje başlığı zorunludur.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingProject) {
        await updateProject(editingProject.id, { title, description, color });
      } else {
        await createProject(title, description, color);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Proje kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2 className="modal-title">
            {editingProject ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.12)', 
            color: 'var(--priority-urgent)', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '16px',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Proje Başlığı *</label>
            <input 
              type="text" 
              placeholder="Örn: Mobil Arayüz Yenilemesi" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <textarea 
              placeholder="Projenin hedefleri ve detayları hakkında kısa bilgi..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Renk Seçici */}
          <div className="form-group">
            <label className="form-label">Pano Teması (Renk)</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid var(--text-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    boxShadow: color === c ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={loading}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : (editingProject ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
