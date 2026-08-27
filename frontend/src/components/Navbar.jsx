import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, Moon, Search, SlidersHorizontal, LogOut, CheckSquare, 
  HelpCircle, User as UserIcon, ShieldAlert, Sparkles 
} from 'lucide-react';
import { setDemoMode } from '../services/api';

const Navbar = ({ onOpenAdmin, isAdminOpen, onOpenProfile }) => {
  const { user, logout, demoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    searchQuery, setSearchQuery, 
    priorityFilter, setPriorityFilter, 
    tagFilter, setTagFilter,
    getProjectTags
  } = useProjects();

  const handleToggleDemoMode = () => {
    setDemoMode(!demoMode);
  };

  const projectTags = getProjectTags();

  return (
    <header className="glass-panel" style={{ 
      borderRadius: '0', 
      borderTop: 'none', 
      borderLeft: 'none', 
      borderRight: 'none',
      padding: '12px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      zIndex: 10
    }}>
      {/* Sol Kısım: Logo ve Durum */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1, #ec4899)', 
            padding: '8px', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff'
          }}>
            <CheckSquare size={20} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.25rem', 
            fontWeight: '700',
            background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AuraTask
          </span>
        </div>

        {/* Demo / Canlı Mod Switcher */}
        <div 
          onClick={handleToggleDemoMode}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '4px 12px', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.75rem', 
            fontWeight: '700',
            cursor: 'pointer',
            background: demoMode ? 'rgba(236, 72, 153, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            color: demoMode ? '#ec4899' : '#6366f1',
            border: `1px solid ${demoMode ? 'rgba(236, 72, 153, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          title={demoMode ? "Yerel tarayıcı veritabanında çalışıyor. Gerçek backend sunucusuna bağlanmak için tıklayın." : "Canlı API sunucusunda çalışıyor. Hızlı demo moduna geçmek için tıklayın."}
        >
          {demoMode ? <Sparkles size={12} /> : <SlidersHorizontal size={12} />}
          <span>{demoMode ? 'DEMO MODU' : 'CANLI SUNUCU'}</span>
        </div>
      </div>

      {/* Orta Kısım: Arama ve Filtreleme */}
      {user && !isAdminOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', maxWidth: '600px', margin: '0 32px' }}>
          {/* Arama Kutusu */}
          <div style={{ position: 'relative', flex: '1' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} />
            <input 
              type="text" 
              placeholder="Görevlerde ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '38px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Öncelik Filtresi */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-input"
            style={{ width: '140px', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="ALL">Tüm Öncelikler</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Etiket Filtresi */}
          {projectTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="form-input"
              style={{ width: '140px', padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <option value="ALL">Tüm Etiketler</option>
              {projectTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Sağ Kısım: Tema, Profil ve Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={toggleTheme} 
          className="btn-text" 
          style={{ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title={theme === 'dark' ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Admin Dashboard Butonu */}
            {user.role === 'ADMIN' && (
              <button 
                onClick={onOpenAdmin}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
              >
                <ShieldAlert size={14} />
                <span>{isAdminOpen ? 'Panoya Dön' : 'Yönetici'}</span>
              </button>
            )}

            {/* Profil Avatar Butonu */}
            <div 
              onClick={onOpenProfile}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              title="Profil Ayarları"
            >
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt={user.name} 
                className="avatar" 
                style={{ margin: 0 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</span>
              </div>
            </div>

            {/* Çıkış Yap Butonu */}
            <button 
              onClick={logout} 
              className="btn-text" 
              style={{ 
                padding: '8px', 
                borderRadius: '50%', 
                color: 'var(--priority-urgent)', 
                display: 'flex', 
                alignItems: 'center',
                border: 'none',
                cursor: 'pointer'
              }}
              title="Oturumu Kapat"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
