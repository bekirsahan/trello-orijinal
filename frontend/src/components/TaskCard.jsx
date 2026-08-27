import React from 'react';
import { Calendar, Tag, AlertCircle } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    // Sürüklenen öğeyi görselleştirmek için opaklık ekleyelim
    setTimeout(() => {
      const element = document.getElementById(`card-${task.id}`);
      if (element) element.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = () => {
    const element = document.getElementById(`card-${task.id}`);
    if (element) element.style.opacity = '1';
  };

  // Tarih biçimlendirme
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  // Son teslim tarihi geçmiş mi kontrolü
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today && task.status !== 'done';
  };

  // Öncelik sınıfı belirle
  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'LOW': return 'badge-low';
      case 'HIGH': return 'badge-high';
      case 'URGENT': return 'badge-urgent';
      default: return 'badge-medium';
    }
  };

  const tagsList = task.tags ? task.tags.split(',') : [];

  return (
    <div
      id={`card-${task.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(task)}
      className="task-card"
    >
      <div className="task-card-header">
        <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
          {task.priority}
        </span>
        
        {task.assignee ? (
          <img
            src={task.assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.name}`}
            alt={task.assignee.name}
            className="avatar"
            style={{ width: '24px', height: '24px' }}
            title={`Atanan kişi: ${task.assignee.name}`}
          />
        ) : (
          <div 
            style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              border: '1px dashed var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              color: 'var(--text-muted)'
            }}
            title="Atanmamış"
          >
            +
          </div>
        )}
      </div>

      {tagsList.length > 0 && (
        <div className="task-card-tags">
          {tagsList.map((tag, idx) => (
            <span key={idx} className="task-tag">{tag.trim()}</span>
          ))}
        </div>
      )}

      <h4 className="task-card-title">{task.title}</h4>
      
      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      {(task.dueDate || tagsList.length > 0) && (
        <div className="task-card-footer">
          {task.dueDate ? (
            <div className={`task-card-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
              {isOverdue(task.dueDate) ? <AlertCircle size={12} /> : <Calendar size={12} />}
              <span>{formatDate(task.dueDate)}</span>
            </div>
          ) : (
            <div />
          )}

          {task.tags && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Tag size={10} />
              <span>{tagsList.length} etiket</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
