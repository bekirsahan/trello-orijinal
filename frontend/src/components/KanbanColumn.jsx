import React, { useState } from 'react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import QuickAddTask from './QuickAddTask';
import { useProjects } from '../context/ProjectContext';
import { Plus } from 'lucide-react';

const COLUMN_CONFIG = {
  todo: {
    label: 'Yapılacaklar',
    icon: '📌',
    accentColor: '#6366f1',
    borderColor: 'rgba(99,102,241,0.4)'
  },
  doing: {
    label: 'Devam Ediyor',
    icon: '⚡',
    accentColor: '#f59e0b',
    borderColor: 'rgba(245,158,11,0.4)'
  },
  done: {
    label: 'Tamamlandı',
    icon: '✅',
    accentColor: '#10b981',
    borderColor: 'rgba(16,185,129,0.4)'
  }
};

const KanbanColumn = ({ status, tasks }) => {
  const { moveTask } = useProjects();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const config = COLUMN_CONFIG[status];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Sadece sütundan gerçekten çıkıldığında tetiklensin
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Sürüklenen kartı bul
    const droppedTask = tasks.find(t => t.id === taskId);
    // Eğer kart zaten bu sütundaysa, sütun güncelleme yapmaya gerek yok
    if (droppedTask) return;

    // Hedef sütundaki son sıraya ekle
    const newOrderIndex = tasks.length;
    await moveTask(taskId, status, newOrderIndex);
  };

  return (
    <>
      <div
        className="kanban-column"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          borderTop: `3px solid ${config.accentColor}`,
        }}
      >
        {/* Sütun Başlığı */}
        <div className="column-header">
          <div className="column-title-container">
            <span style={{ fontSize: '1rem' }}>{config.icon}</span>
            <span className="column-title">{config.label}</span>
            <span className="column-count">{tasks.length}</span>
          </div>
        </div>

        {/* Kart Alanı */}
        <div className={`column-body ${isDragOver ? 'drag-over' : ''}`}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={(t) => setSelectedTask(t)}
            />
          ))}

          {/* Hızlı Görev Ekleme Formu */}
          {showAddForm ? (
            <QuickAddTask
              status={status}
              onClose={() => setShowAddForm(false)}
              onSuccess={() => setShowAddForm(false)}
            />
          ) : (
            <button
              className="add-card-btn"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              Yeni Görev Ekle
            </button>
          )}
        </div>
      </div>

      {/* Görev Detay Modalı */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          mode="view"
        />
      )}
    </>
  );
};

export default KanbanColumn;
