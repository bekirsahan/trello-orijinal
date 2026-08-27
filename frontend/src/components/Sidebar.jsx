import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { FolderKanban, Plus, Settings, ChevronRight } from 'lucide-react';

const Sidebar = ({ onOpenProjectModal }) => {
  const { projects, currentProject, selectProject, loadingProjects } = useProjects();

  return (
    <aside className="glass-panel" style={{ 
      width: '260px', 
      minWidth: '260px',
      borderRadius: '0', 
      borderTop: 'none', 
      borderLeft: 'none', 
      borderBottom: 'none',
      display: 'flex', 
      flexDirection: 'column', 
      padding: '24px 16px',
      height: '100%'
    }}>
      {/* Başlık ve Ekleme Butonu */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '0 8px'
      }}>
        <h3 style={{ 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          color: 'var(--text-muted)' 
        }}>
          Projelerim ({projects.length})
        </h3>
        <button 
          onClick={() => onOpenProjectModal(null)} 
          className="btn-text" 
          style={{ 
            padding: '4px', 
            borderRadius: '6px', 
            background: 'var(--bg-tertiary)', 
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Yeni Proje Ekle"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Proje Listesi */}
      <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {loadingProjects ? (
          <div style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Yükleniyor...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Proje bulunamadı. Yeni bir tane ekleyin!
          </div>
        ) : (
          projects.map((proj) => {
            const isActive = currentProject && currentProject.id === proj.id;
            return (
              <div 
                key={proj.id}
                onClick={() => selectProject(proj.id)}
                className="hover-scale"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 12px', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer',
                  background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '3px', 
                    background: proj.color || '#6366f1',
                    flexShrink: 0
                  }} />
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: isActive ? '600' : '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {proj.title}
                  </span>
                </div>
                
                {isActive && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
              </div>
            );
          })
        )}
      </div>

      {/* Alt Bölüm Ayarlar veya Yardım */}
      <div style={{ 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: '16px', 
        marginTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          padding: '10px 12px', 
          borderRadius: 'var(--radius-sm)', 
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          cursor: 'pointer'
        }}>
          <FolderKanban size={16} />
          <span>Sistem Rehberi</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
