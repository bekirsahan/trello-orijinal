// React Native – API Servisi
// Backend veya Demo Mode'a bağlanan ortak istek yöneticisi

const API_URL = 'http://localhost:5000/api';

// Yerel depolama (AsyncStorage veya web localStorage)
let tokenStore = null;
let userStore = null;

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(tokenStore && { Authorization: `Bearer ${tokenStore}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Hatası');
  return data;
};

export const setToken = (token, user) => {
  tokenStore = token;
  userStore = user;
};

export const clearToken = () => {
  tokenStore = null;
  userStore = null;
};

export const mobileApi = {
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token, res.user);
    return res;
  },

  register: async (name, email, password) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(res.token, res.user);
    return res;
  },

  getMe: async () => {
    return await request('/auth/me');
  },

  getProjects: async () => {
    return await request('/projects');
  },

  getProjectById: async (id) => {
    return await request(`/projects/${id}`);
  },

  createTask: async (taskData) => {
    return await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTaskStatus: async (taskId, status, orderIndex) => {
    return await request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, orderIndex }),
    });
  },

  deleteTask: async (taskId) => {
    return await request(`/tasks/${taskId}`, { method: 'DELETE' });
  },
};
