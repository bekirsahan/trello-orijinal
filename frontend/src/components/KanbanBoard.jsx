import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import ProjectModal from './ProjectModal';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Settings, UserPlus, Users, Trash2, Loader } from 'lucide-react';

const KanbanBoard = () => {
  const { currentProject, loadingDetail, getFilteredTasks, deleteProject, addMember, removeMember } = useProjects();
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  if (loadingDetail) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader size={40} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Pano yükleniyor...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '4rem' }}>📋</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Proje Seçin veya Oluşturun</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
          Sol menüden mevcut bir projeyi seçin ya da yeni bir proje panosu oluşturmak için <strong>+</strong> butonunu kullanın.
        </p>
      </div>
    );
  }

  const allFilteredTasks = getFilteredTasks();
  const todoTasks = allFilteredTasks.filter(t => t.status === 'todo').sort((a, b) => a.orderIndex - b.orderIndex);
  const doingTasks = allFilteredTasks.filter(t => t.status === 'doing').sort((a, b) => a.orderIndex - b.orderIndex);
  const doneTasks = allFilteredTasks.filter(t => t.status === 'done').sort((a, b) => a.orderIndex - b.orderIndex);

  const isOwner = currentProject.members?.some(m => m.userId === user?.id && m.role === 'OWNER');

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteError('');
    try {
      await addMember(inviteEmail.trim());
      setInviteEmail('');
    } catch (err) {
      setInviteError(err.message || 'Üye eklenirken hata oluştu.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`"${currentProject.title}" projesini ve tüm görevlerini silmek istediğinizden emin misiniz?`)) return;
    await deleteProject(currentProject.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Board Header */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '14px', height: '14px', borderRadius: '4px',
            background: currentProject.color || '#6366f1',
            boxShadow: `0 0 10px ${currentProject.color || '#6366f1'}60`
          }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{currentProject.title}</h2>
          {currentProject.description && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'none' }}>{currentProject.description}</span>
          )}
        </div>

        {/* Sağ Araçlar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Üye Avatarları */}
          <div className="avatar-group" style={{ marginRight: '4px' }}>
            {currentProject.members?.slice(0, 4).map(m => (
              <img key={m.userId} src={m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.name}`}
                alt={m.user?.name} className="avatar" title={m.user?.name} />
            ))}
            {currentProject.members?.length > 4 && (
              <div className="avatar" style={{ background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                +{currentProject.members.length - 4}
              </div>
            )}
          </div>

          {isOwner && (
            <>
              <button onClick={() => setShowMembersPanel(v => !v)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Users size={14} /> Üyeler
              </button>
              <button onClick={() => setShowEditModal(true)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Settings size={14} /> Ayarlar
              </button>
              <button onClick={handleDeleteProject} className="btn" style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', color: 'var(--priority-urgent)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Üye Paneli */}
      {showMembersPanel && isOwner && (
        <div style={{
          padding: '16px 24px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '32px',
          flexWrap: 'wrap'
        }}>
          {/* Davet Formu */}
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>YENİ ÜYE EKLE</p>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px' }}>
              <input type="email" placeholder="E-posta adresi" value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="form-input" style={{ width: '220px', padding: '8px 12px', fontSize: '0.85rem' }} />
              <button type="submit" className="btn btn-primary" disabled={inviteLoading} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <UserPlus size={14} /> Ekle
              </button>
            </form>
            {inviteError && <p style={{ fontSize: '0.8rem', color: 'var(--priority-urgent)', marginTop: '6px' }}>{inviteError}</p>}
          </div>

          {/* Mevcut Üyeler */}
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>MEVCUT ÜYELER ({currentProject.members?.length})</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentProject.members?.map(m => (
                <div key={m.userId} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px', borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  fontSize: '0.8rem'
                }}>
                  <img src={m.user?.avatar} alt={m.user?.name} className="avatar" style={{ width: '20px', height: '20px', margin: 0 }} />
                  <span>{m.user?.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{m.role}</span>
                  {m.role !== 'OWNER' && m.userId !== user?.id && (
                    <button onClick={() => removeMember(m.userId)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
                    }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kanban Sütunları */}
      <div className="board-container">
        <KanbanColumn status="todo" tasks={todoTasks} />
        <KanbanColumn status="doing" tasks={doingTasks} />
        <KanbanColumn status="done" tasks={doneTasks} />
      </div>

      {/* Proje Düzenleme Modalı */}
      {showEditModal && (
        <ProjectModal
          onClose={() => setShowEditModal(false)}
          editingProject={currentProject}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
