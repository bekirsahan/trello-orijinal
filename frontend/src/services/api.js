import { initialMockData } from './mockData';

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Demo Modu Kontrolü
export const getDemoMode = () => {
  const mode = localStorage.getItem('demo_mode');
  return mode === null ? true : mode === 'true'; // Varsayılan olarak DEMO/MOCK modda başlasın ki sorunsuz çalışsın!
};

export const setDemoMode = (val) => {
  localStorage.setItem('demo_mode', val.toString());
  window.dispatchEvent(new Event('demo_mode_change'));
};

// Yerel (Mock) Veritabanı Yükleme/İlklendirme
const getMockDB = () => {
  const db = localStorage.getItem('mock_db');
  if (!db) {
    localStorage.setItem('mock_db', JSON.stringify(initialMockData));
    return initialMockData;
  }
  return JSON.parse(db);
};

const saveMockDB = (data) => {
  localStorage.setItem('mock_db', JSON.stringify(data));
};

// İstek Helper'ı (Canlı Sunucu İçin)
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Bir API hatası oluştu.');
  }
  return data;
};

export const api = {
  // ==========================================
  // AUTH
  // ==========================================
  login: async (email, password) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const user = db.users.find(u => u.email === email);
      if (!user) throw new Error('E-posta adresi veya şifre hatalı.');
      // Demo ortamında şifre kontrolü basitleştirilmiştir
      const token = `mock_token_${user.id}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user, token };
    } else {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    }
  },

  register: async (name, email, password) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const exists = db.users.some(u => u.email === email.toLowerCase());
      if (exists) throw new Error('Bu e-posta adresi zaten kullanımda.');

      const newUser = {
        id: `u_${Date.now()}`,
        email: email.toLowerCase(),
        name,
        role: db.users.length === 0 ? 'ADMIN' : 'USER',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      };

      db.users.push(newUser);
      saveMockDB(db);

      const token = `mock_token_${newUser.id}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true, user: newUser, token };
    } else {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    }
  },

  getMe: async () => {
    if (getDemoMode()) {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('Oturum bulunamadı.');
      return { success: true, user: JSON.parse(userStr) };
    } else {
      return await request('/auth/me');
    }
  },

  updateProfile: async (data) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const idx = db.users.findIndex(u => u.id === currentUser.id);
      if (idx === -1) throw new Error('Kullanıcı bulunamadı.');

      const updated = { ...db.users[idx], ...data };
      db.users[idx] = updated;
      saveMockDB(db);
      localStorage.setItem('user', JSON.stringify(updated));
      return { success: true, user: updated };
    } else {
      return await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  },

  // ==========================================
  // PROJECTS
  // ==========================================
  getProjects: async () => {
    if (getDemoMode()) {
      const db = getMockDB();
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) return { success: true, projects: [] };

      // Kullanıcının üyesi olduğu projeleri listele
      const memberProjectIds = db.projectMembers
        .filter(m => m.userId === currentUser.id)
        .map(m => m.projectId);

      const projects = db.projects
        .filter(p => memberProjectIds.includes(p.id))
        .map(p => {
          const owner = db.users.find(u => u.id === p.ownerId);
          return { ...p, owner };
        });

      return { success: true, projects };
    } else {
      return await request('/projects');
    }
  },

  createProject: async (projectData) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) throw new Error('Yetkisiz işlem.');

      const newProj = {
        id: `p_${Date.now()}`,
        ...projectData,
        ownerId: currentUser.id
      };

      db.projects.push(newProj);
      db.projectMembers.push({
        id: `pm_${Date.now()}`,
        projectId: newProj.id,
        userId: currentUser.id,
        role: 'OWNER'
      });

      saveMockDB(db);
      return { success: true, project: newProj };
    } else {
      return await request('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    }
  },

  getProjectById: async (id) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) throw new Error('Yetkisiz işlem.');

      const project = db.projects.find(p => p.id === id);
      if (!project) throw new Error('Proje bulunamadı.');

      const isMember = db.projectMembers.some(m => m.projectId === id && m.userId === currentUser.id);
      if (!isMember) throw new Error('Bu projeyi görüntüleme yetkiniz yok.');

      // Proje görevleri
      const tasks = db.tasks
        .filter(t => t.projectId === id)
        .map(t => {
          const assignee = db.users.find(u => u.id === t.assigneeId) || null;
          const creator = db.users.find(u => u.id === t.createdById) || null;
          return { ...t, assignee, creator };
        });

      // Proje üyeleri
      const members = db.projectMembers
        .filter(m => m.projectId === id)
        .map(m => {
          const user = db.users.find(u => u.id === m.userId);
          return { ...m, user };
        });

      const owner = db.users.find(u => u.id === project.ownerId);

      return {
        success: true,
        project: {
          ...project,
          tasks,
          members,
          owner
        }
      };
    } else {
      return await request(`/projects/${id}`);
    }
  },

  updateProject: async (id, projectData) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const idx = db.projects.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Proje bulunamadı.');

      db.projects[idx] = { ...db.projects[idx], ...projectData };
      saveMockDB(db);
      return { success: true, project: db.projects[idx] };
    } else {
      return await request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
    }
  },

  deleteProject: async (id) => {
    if (getDemoMode()) {
      const db = getMockDB();
      db.projects = db.projects.filter(p => p.id !== id);
      db.projectMembers = db.projectMembers.filter(pm => pm.projectId !== id);
      db.tasks = db.tasks.filter(t => t.projectId !== id);
      saveMockDB(db);
      return { success: true, message: 'Proje başarıyla silindi.' };
    } else {
      return await request(`/projects/${id}`, {
        method: 'DELETE',
      });
    }
  },

  addMember: async (projectId, email, role = 'MEMBER') => {
    if (getDemoMode()) {
      const db = getMockDB();
      const targetUser = db.users.find(u => u.email === email.toLowerCase());
      if (!targetUser) throw new Error('Bu e-posta adresine sahip kullanıcı bulunamadı.');

      const alreadyMember = db.projectMembers.some(pm => pm.projectId === projectId && pm.userId === targetUser.id);
      if (alreadyMember) throw new Error('Kullanıcı zaten projenin üyesi.');

      const newMember = {
        id: `pm_${Date.now()}`,
        projectId,
        userId: targetUser.id,
        role
      };

      db.projectMembers.push(newMember);
      saveMockDB(db);

      return {
        success: true,
        member: {
          ...newMember,
          user: targetUser
        }
      };
    } else {
      return await request(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
    }
  },

  removeMember: async (projectId, memberUserId) => {
    if (getDemoMode()) {
      const db = getMockDB();
      db.projectMembers = db.projectMembers.filter(
        pm => !(pm.projectId === projectId && pm.userId === memberUserId)
      );
      saveMockDB(db);
      return { success: true };
    } else {
      return await request(`/projects/${projectId}/members/${memberUserId}`, {
        method: 'DELETE',
      });
    }
  },

  // ==========================================
  // TASKS
  // ==========================================
  createTask: async (taskData) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) throw new Error('Yetkisiz işlem.');

      const columnTasks = db.tasks.filter(
        t => t.projectId === taskData.projectId && t.status === 'todo'
      );
      const orderIndex = columnTasks.length;

      const newTask = {
        id: `t_${Date.now()}`,
        status: 'todo',
        orderIndex,
        createdById: currentUser.id,
        ...taskData
      };

      db.tasks.push(newTask);
      saveMockDB(db);

      const assignee = db.users.find(u => u.id === newTask.assigneeId) || null;
      const creator = db.users.find(u => u.id === newTask.createdById) || null;

      return {
        success: true,
        task: { ...newTask, assignee, creator }
      };
    } else {
      return await request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    }
  },

  updateTask: async (id, taskData) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const idx = db.tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Görev bulunamadı.');

      db.tasks[idx] = { ...db.tasks[idx], ...taskData };
      saveMockDB(db);

      const assignee = db.users.find(u => u.id === db.tasks[idx].assigneeId) || null;
      const creator = db.users.find(u => u.id === db.tasks[idx].createdById) || null;

      return {
        success: true,
        task: { ...db.tasks[idx], assignee, creator }
      };
    } else {
      return await request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
    }
  },

  updateTaskStatus: async (id, status, orderIndex) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const idx = db.tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Görev bulunamadı.');

      db.tasks[idx].status = status;
      db.tasks[idx].orderIndex = orderIndex;
      saveMockDB(db);

      const assignee = db.users.find(u => u.id === db.tasks[idx].assigneeId) || null;
      const creator = db.users.find(u => u.id === db.tasks[idx].createdById) || null;

      return {
        success: true,
        task: { ...db.tasks[idx], assignee, creator }
      };
    } else {
      return await request(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, orderIndex }),
      });
    }
  },

  deleteTask: async (id) => {
    if (getDemoMode()) {
      const db = getMockDB();
      db.tasks = db.tasks.filter(t => t.id !== id);
      saveMockDB(db);
      return { success: true, message: 'Görev başarıyla silindi.' };
    } else {
      return await request(`/tasks/${id}`, {
        method: 'DELETE',
      });
    }
  },

  // ==========================================
  // ADMIN & STATS
  // ==========================================
  getStats: async () => {
    if (getDemoMode()) {
      const db = getMockDB();
      const statusCounts = { todo: 0, doing: 0, done: 0 };
      db.tasks.forEach(t => {
        if (statusCounts[t.status] !== undefined) {
          statusCounts[t.status]++;
        }
      });

      return {
        success: true,
        stats: {
          totalUsers: db.users.length,
          totalProjects: db.projects.length,
          totalTasks: db.tasks.length,
          tasksByStatus: statusCounts,
        },
        latestUsers: db.users.slice(-5).reverse(),
      };
    } else {
      return await request('/admin/stats');
    }
  },

  getUsers: async () => {
    if (getDemoMode()) {
      const db = getMockDB();
      return { success: true, users: db.users };
    } else {
      return await request('/admin/users');
    }
  },

  updateUserRole: async (userId, role) => {
    if (getDemoMode()) {
      const db = getMockDB();
      const idx = db.users.findIndex(u => u.id === userId);
      if (idx === -1) throw new Error('Kullanıcı bulunamadı.');

      db.users[idx].role = role;
      saveMockDB(db);
      return { success: true, user: db.users[idx] };
    } else {
      return await request(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    }
  },

  deleteUser: async (userId) => {
    if (getDemoMode()) {
      const db = getMockDB();
      db.users = db.users.filter(u => u.id !== userId);
      db.projectMembers = db.projectMembers.filter(pm => pm.userId !== userId);
      // Atanan görevleri temizle
      db.tasks = db.tasks.map(t => t.assigneeId === userId ? { ...t, assigneeId: null } : t);
      saveMockDB(db);
      return { success: true };
    } else {
      return await request(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    }
  }
};
