import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Tag, User as UserIcon, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUS_LABELS = { todo: 'Yapılacak', doing: 'Devam Ediyor', done: 'Tamamlandı' };

const TaskModal = ({ task, onClose, mode = 'view' }) => {
  const { updateTask, deleteTask, currentProject } = useProjects();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'todo',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assigneeId: task?.assigneeId || '',
    tags: task?.tags || ''
  });

  const members = currentProject?.members || [];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Görev başlığı zorunludur.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await updateTask(task.id, {
        ...formData,
        dueDate: formData.dueDate || null,
        assigneeId: formData.assigneeId || null
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Görev güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteTask(task.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Görev silinirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'LOW': return 'var(--priority-low)';
      case 'HIGH': return 'var(--priority-high)';
      case 'URGENT': return 'var(--priority-urgent)';
      default: return 'var(--priority-medium)';
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-panel" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="modal-title">
              {isEditing ? (task?.id ? 'Görevi Düzenle' : 'Yeni Görev') : 'Görev Detayı'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Edit3 size={14} /> Düzenle
              </button>
            )}
            <button onClick={onClose} className="modal-close"><X size={20} /></button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--priority-urgent)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        {/* Form / View alanı */}
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Görev Başlığı *</label>
              <input type="text" className="form-input" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Görev başlığını girin..." />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Açıklama</label>
              <textarea className="form-input" rows={4} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Görev detaylarını açıklayın..." style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Öncelik</label>
                <select className="form-input" value={formData.priority} onChange={(e) => handleChange('priority', e.target.value)} style={{ cursor: 'pointer' }}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Durum</label>
                <select className="form-input" value={formData.status} onChange={(e) => handleChange('status', e.target.value)} style={{ cursor: 'pointer' }}>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Son Tarih</label>
                <input type="date" className="form-input" value={formData.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Atanan Kişi</label>
                <select className="form-input" value={formData.assigneeId} onChange={(e) => handleChange('assigneeId', e.target.value)} style={{ cursor: 'pointer' }}>
                  <option value="">Atanmamış</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user?.name || m.userId}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Etiketler (virgülle ayırın)</label>
              <input type="text" className="form-input" value={formData.tags} onChange={(e) => handleChange('tags', e.target.value)} placeholder="Örn: Backend,Frontend,Tasarım" />
            </div>
          </div>
        ) : (
          /* View Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{task?.title}</h3>

            {task?.description && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem' }}>{task.description}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Öncelik</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: getPriorityColor(task?.priority) }}>{task?.priority}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Durum</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{STATUS_LABELS[task?.status]}</span>
              </div>
              {task?.dueDate && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Son Tarih</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
              {task?.assignee && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atanan</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={task.assignee.avatar} alt={task.assignee.name} className="avatar" style={{ width: '24px', height: '24px', margin: 0 }} />
                    <span style={{ fontSize: '0.9rem' }}>{task.assignee.name}</span>
                  </div>
                </div>
              )}
            </div>

            {task?.tags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {task.tags.split(',').map((tag, i) => (
                  <span key={i} className="task-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={10} />{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="modal-actions">
          {task?.id && (
            <button onClick={handleDelete} className="btn" disabled={loading}
              style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--priority-urgent)', border: '1px solid rgba(239,68,68,0.2)', marginRight: 'auto' }}>
              <Trash2 size={14} /> Sil
            </button>
          )}
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>İptal</button>
          {isEditing && (
            <button onClick={handleSave} className="btn btn-primary" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
