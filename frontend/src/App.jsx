import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import AdminView from './components/AdminView';
import ProjectModal from './components/ProjectModal';
import './index.css';
import './styles/kanban.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleOpenProjectModal = (project = null) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setEditingProject(null);
  };

  // Sayfa Yükleniyor
  if (loading) {
    return (
      <div style={{
        display: 'flex', minHeight: '100vh', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '16px',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          width: '50px', height: '50px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #6366f1, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AuraTask yükleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Giriş Yapılmamışsa Auth Sayfası
  if (!user) {
    return <AuthPage />;
  }

  // Ana Uygulama
  return (
    <ProjectProvider>
      <div className="app-container">
        <Sidebar onOpenProjectModal={handleOpenProjectModal} />
        <div className="main-content">
          <Navbar
            onOpenAdmin={() => setShowAdminPanel(v => !v)}
            isAdminOpen={showAdminPanel}
            onOpenProfile={() => {}}
          />
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {showAdminPanel && user.role === 'ADMIN' ? (
              <AdminView />
            ) : (
              <KanbanBoard />
            )}
          </div>
        </div>
      </div>

      {/* Proje Oluşturma / Düzenleme Modalı */}
      {showProjectModal && (
        <ProjectModal
          onClose={handleCloseProjectModal}
          editingProject={editingProject}
        />
      )}
    </ProjectProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
