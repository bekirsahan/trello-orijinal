import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, User, Lock, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('İsim alanı zorunludur.'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ name: '', email: 'user@example.com', password: 'user123' });
    setIsLogin(true);
  };

  const fillAdmin = () => {
    setForm({ name: '', email: 'admin@example.com', password: 'admin123' });
    setIsLogin(true);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Arka Plan Dekoratif Elementler */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Auth Kartı */}
      <div className="glass-panel" style={{ width: '420px', padding: '40px', margin: '20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            marginBottom: '16px', boxShadow: '0 10px 30px rgba(99,102,241,0.3)'
          }}>
            <CheckSquare size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
            AuraTask
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? 'Hesabınıza giriş yapın' : 'Ücretsiz hesap oluşturun'}
          </p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', color: 'var(--priority-urgent)',
            padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            marginBottom: '20px', fontSize: '0.85rem', fontWeight: '600',
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ad Soyad</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Adınız ve soyadınız" value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="form-input" style={{ paddingLeft: '42px' }} required />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">E-posta</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" placeholder="ornek@mail.com" value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="form-input" style={{ paddingLeft: '42px' }} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Şifre</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="En az 6 karakter"
                value={form.password} onChange={(e) => handleChange('password', e.target.value)}
                className="form-input" style={{ paddingLeft: '42px', paddingRight: '42px' }} required />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
              }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}>
            {loading ? 'Lütfen bekleyin...' : isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>
        </form>

        {/* Hızlı Demo Girişi */}
        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} /> DEMO HIZLI GİRİŞ
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={fillDemo} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}>
              👤 Normal Kullanıcı
            </button>
            <button onClick={fillAdmin} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}>
              🛡️ Yönetici
            </button>
          </div>
        </div>

        {/* Geçiş Linki */}
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '20px' }}>
          {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}{' '}
          <button onClick={() => { setIsLogin(v => !v); setError(''); }} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.9rem'
          }}>
            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
