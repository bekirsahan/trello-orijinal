import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getDemoMode } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemo] = useState(getDemoMode());

  // Oturum durumunu yükle
  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await api.getMe();
        if (res.success) {
          setUser(res.user);
        } else {
          logout();
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Yetkilendirme kontrol hatası:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Demo modu değişikliklerini dinle
    const handleDemoChange = () => {
      setDemo(getDemoMode());
      // Mod değiştiğinde token ve eski oturumu sıfırlayalım ki karışıklık olmasın
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      checkAuth();
    };

    window.addEventListener('demo_mode_change', handleDemoChange);
    return () => window.removeEventListener('demo_mode_change', handleDemoChange);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, demoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
