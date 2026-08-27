import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user, demoMode } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');

  // Kullanıcının projelerini yükle
  const loadProjects = async () => {
    if (!user) {
      setProjects([]);
      setCurrentProject(null);
      return;
    }
    setLoadingProjects(true);
    try {
      const res = await api.getProjects();
      if (res.success) {
        setProjects(res.projects);
        // Eğer seçili proje yoksa ve proje varsa, ilkini varsayılan olarak seç
        if (res.projects.length > 0 && !currentProject) {
          loadProjectDetail(res.projects[0].id);
        }
      }
    } catch (err) {
      console.error('Projeler yüklenirken hata:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Tekil proje detaylarını (üyeler ve görevler dahil) yükle
  const loadProjectDetail = async (projectId) => {
    setLoadingDetail(true);
    try {
      const res = await api.getProjectById(projectId);
      if (res.success) {
        setCurrentProject(res.project);
      }
    } catch (err) {
      console.error('Proje detayı yüklenirken hata:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user, demoMode]);

  // Yeni Proje Oluştur
  const createProject = async (title, description, color) => {
    try {
      const res = await api.createProject({ title, description, color });
      if (res.success) {
        await loadProjects();
        await loadProjectDetail(res.project.id);
      }
      return res;
    } catch (err) {
      console.error('Proje oluşturma hatası:', err);
      throw err;
    }
  };

  // Proje Güncelle
  const updateProject = async (projectId, data) => {
    try {
      const res = await api.updateProject(projectId, data);
      if (res.success) {
        await loadProjects();
        if (currentProject && currentProject.id === projectId) {
          await loadProjectDetail(projectId);
        }
      }
      return res;
    } catch (err) {
      console.error('Proje güncelleme hatası:', err);
      throw err;
    }
  };

  // Proje Sil
  const deleteProject = async (projectId) => {
    try {
      const res = await api.deleteProject(projectId);
      if (res.success) {
        setCurrentProject(null);
        await loadProjects();
      }
      return res;
    } catch (err) {
      console.error('Proje silme hatası:', err);
      throw err;
    }
  };

  // Üye Ekle
  const addMember = async (email, role) => {
    if (!currentProject) return;
    try {
      const res = await api.addMember(currentProject.id, email, role);
      if (res.success) {
        await loadProjectDetail(currentProject.id);
      }
      return res;
    } catch (err) {
      console.error('Üye ekleme hatası:', err);
      throw err;
    }
  };

  // Üye Çıkar
  const removeMember = async (memberUserId) => {
    if (!currentProject) return;
    try {
      const res = await api.removeMember(currentProject.id, memberUserId);
      if (res.success) {
        // Eğer kendimiz ayrılıyorsak projeleri yeniden yükleyelim
        if (user.id === memberUserId) {
          setCurrentProject(null);
          await loadProjects();
        } else {
          await loadProjectDetail(currentProject.id);
        }
      }
      return res;
    } catch (err) {
      console.error('Üye çıkarma hatası:', err);
      throw err;
    }
  };

  // ==========================================
  // GÖREV İŞLEMLERİ (TASKS)
  // ==========================================

  // Görev Oluştur
  const createTask = async (taskData) => {
    if (!currentProject) return;
    try {
      const res = await api.createTask({
        projectId: currentProject.id,
        ...taskData
      });
      if (res.success) {
        await loadProjectDetail(currentProject.id);
      }
      return res;
    } catch (err) {
      console.error('Görev oluşturma hatası:', err);
      throw err;
    }
  };

  // Görev Güncelle
  const updateTask = async (taskId, taskData) => {
    if (!currentProject) return;
    try {
      const res = await api.updateTask(taskId, taskData);
      if (res.success) {
        await loadProjectDetail(currentProject.id);
      }
      return res;
    } catch (err) {
      console.error('Görev güncelleme hatası:', err);
      throw err;
    }
  };

  // Sürükle-Bırak Sütun veya Sıralama Güncelle (PATCH)
  const moveTask = async (taskId, newStatus, newOrderIndex) => {
    if (!currentProject) return;

    // Arayüzde anlık kaydırma hissiyatı için Local State'i hızlıca güncelleyelim (Optimistic Update)
    const updatedTasks = currentProject.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus, orderIndex: newOrderIndex };
      }
      return t;
    });
    setCurrentProject(prev => ({ ...prev, tasks: updatedTasks }));

    try {
      await api.updateTaskStatus(taskId, newStatus, newOrderIndex);
      // Arka planda tam verileri güncelleyelim
      await loadProjectDetail(currentProject.id);
    } catch (err) {
      console.error('Görev taşıma hatası:', err);
      // Hata durumunda eski haline döndürmek için tekrar yükleme yapalım
      await loadProjectDetail(currentProject.id);
    }
  };

  // Görev Sil
  const deleteTask = async (taskId) => {
    if (!currentProject) return;
    try {
      const res = await api.deleteTask(taskId);
      if (res.success) {
        await loadProjectDetail(currentProject.id);
      }
      return res;
    } catch (err) {
      console.error('Görev silme hatası:', err);
      throw err;
    }
  };

  // Görevleri filtrele (Arama, Öncelik, Etiket)
  const getFilteredTasks = () => {
    if (!currentProject || !currentProject.tasks) return [];
    return currentProject.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

      const matchesTag = tagFilter === 'ALL' || (task.tags && task.tags.split(',').includes(tagFilter));

      return matchesSearch && matchesPriority && matchesTag;
    });
  };

  // Projedeki benzersiz etiketlerin listesini çıkar (Filtreleme menüsü için)
  const getProjectTags = () => {
    if (!currentProject || !currentProject.tasks) return [];
    const tags = new Set();
    currentProject.tasks.forEach(t => {
      if (t.tags) {
        t.tags.split(',').forEach(tag => tags.add(tag.trim()));
      }
    });
    return Array.from(tags);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      loadingProjects,
      loadingDetail,
      searchQuery,
      setSearchQuery,
      priorityFilter,
      setPriorityFilter,
      tagFilter,
      setTagFilter,
      loadProjects,
      selectProject: loadProjectDetail,
      createProject,
      updateProject,
      deleteProject,
      addMember,
      removeMember,
      createTask,
      updateTask,
      moveTask,
      deleteTask,
      getFilteredTasks,
      getProjectTags
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
