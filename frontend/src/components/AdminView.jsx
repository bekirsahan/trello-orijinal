import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, FolderKanban, CheckSquare, ShieldAlert, Trash2, RefreshCw } from 'lucide-react';

const AdminView = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes] = await Promise.all([api.getStats(), api.getUsers()]);
      if (statsRes.success) setStats(statsRes);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      await loadData();
    } catch (err) {
      alert('Rol güncellenemedi: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz?`)) return;
    try {
      await api.deleteUser(userId);
      await loadData();
    } catch (err) {
      alert('Kullanıcı silinemedi: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw size={32} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Yönetici verileri yükleniyor...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statCards = [
    { label: 'Toplam Kullanıcı', value: stats?.stats?.totalUsers ?? 0, icon: <Users size={22} />, color: '#6366f1' },
    { label: 'Toplam Proje', value: stats?.stats?.totalProjects ?? 0, icon: <FolderKanban size={22} />, color: '#ec4899' },
    { label: 'Toplam Görev', value: stats?.stats?.totalTasks ?? 0, icon: <CheckSquare size={22} />, color: '#10b981' },
    { label: 'Tamamlananlar', value: stats?.stats?.tasksByStatus?.done ?? 0, icon: <BarChart3 size={22} />, color: '#f59e0b' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', padding: '10px', borderRadius: '12px', color: '#fff', display: 'flex' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Yönetici Paneli</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sistem istatistikleri ve kullanıcı yönetimi</p>
          </div>
        </div>
        <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--priority-urgent)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontWeight: '600' }}>
          {error}
        </div>
      )}

      {/* İstatistik Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {statCards.map((sc) => (
          <div key={sc.label} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: `${sc.color}20`, color: sc.color }}>
              {sc.icon}
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{sc.value}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{sc.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Görev Durum Dağılımı */}
      {stats?.stats?.tasksByStatus && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Görev Durum Dağılımı</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Yapılacak', key: 'todo', color: '#6366f1' },
              { label: 'Devam Ediyor', key: 'doing', color: '#f59e0b' },
              { label: 'Tamamlandı', key: 'done', color: '#10b981' }
            ].map(({ label, key, color }) => {
              const count = stats.stats.tasksByStatus[key] || 0;
              const total = stats.stats.totalTasks || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '600' }}>{label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kullanıcı Yönetim Tablosu */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>
          Kullanıcı Yönetimi ({users.length} kullanıcı)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Kullanıcı', 'E-posta', 'Rol', 'Kayıt Tarihi', 'İşlemler'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                        alt={u.name} className="avatar" style={{ width: '32px', height: '32px', margin: 0 }} />
                      <span style={{ fontWeight: '600' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {u.id === user?.id ? (
                      <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.12)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '700' }}>
                        {u.role} (Ben)
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {u.id !== user?.id && (
                      <button onClick={() => handleDeleteUser(u.id, u.name)} style={{
                        background: 'rgba(239,68,68,0.1)', color: 'var(--priority-urgent)',
                        border: '1px solid rgba(239,68,68,0.2)', padding: '6px', borderRadius: '6px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem'
                      }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
