import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { X, Plus, CheckCircle2 } from 'lucide-react';

const QuickAddTask = ({ status = 'todo', onClose, onSuccess }) => {
  const { createTask } = useProjects();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTask({ title: title.trim(), priority, status });
      setTitle('');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Görev eklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
        type="text"
        placeholder="Görev başlığını girin..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="form-input"
        autoFocus
        style={{ fontSize: '0.85rem', padding: '10px 12px' }}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="form-input"
          style={{ flex: 1, fontSize: '0.8rem', padding: '8px', cursor: 'pointer' }}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
          {loading ? '...' : <><Plus size={14} /> Ekle</>}
        </button>
        <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '8px 10px' }}>
          <X size={14} />
        </button>
      </div>
    </form>
  );
};

export default QuickAddTask;
