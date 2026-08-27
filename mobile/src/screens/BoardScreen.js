// React Native – BoardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { mobileApi } from '../services/api';

const STATUS_LABELS = { todo: '📌 Yapılacak', doing: '⚡ Devam Ediyor', done: '✅ Tamamlandı' };
const PRIORITY_COLORS = { LOW: '#34d399', MEDIUM: '#fbbf24', HIGH: '#fb923c', URGENT: '#f87171' };

const TaskCard = ({ task, onStatusChange }) => {
  const nextStatus = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo';
  const nextLabel = task.status === 'todo' ? 'Başlat' : task.status === 'doing' ? 'Tamamla' : 'Geri Al';

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={[styles.priorityBadge, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority}</Text>
        {task.assignee && (
          <Text style={styles.assignee}>👤 {task.assignee.name}</Text>
        )}
      </View>
      <Text style={styles.taskTitle}>{task.title}</Text>
      {task.description && (
        <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
      )}
      {task.dueDate && (
        <Text style={styles.taskDate}>📅 {new Date(task.dueDate).toLocaleDateString('tr-TR')}</Text>
      )}
      <TouchableOpacity style={styles.statusBtn} onPress={() => onStatusChange(task.id, nextStatus)}>
        <Text style={styles.statusBtnText}>{nextLabel} →</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function BoardScreen({ route }) {
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProject = async () => {
    try {
      const res = await mobileApi.getProjectById(projectId);
      if (res.success) setProject(res.project);
    } catch (err) {
      console.error('Proje yüklenemedi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await mobileApi.updateTaskStatus(taskId, newStatus, 0);
      loadProject();
    } catch (err) {
      console.error('Durum değiştirilemedi:', err);
    }
  };

  useEffect(() => { loadProject(); }, [projectId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#94a3b8' }}>Proje yüklenemedi.</Text>
      </View>
    );
  }

  const getTasksByStatus = (status) => (project.tasks || []).filter(t => t.status === status).sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProject(); }} tintColor="#6366f1" />}
    >
      {['todo', 'doing', 'done'].map(status => {
        const tasks = getTasksByStatus(status);
        return (
          <View key={status} style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>{STATUS_LABELS[status]}</Text>
              <View style={styles.columnCount}><Text style={styles.columnCountText}>{tasks.length}</Text></View>
            </View>
            {tasks.length === 0 ? (
              <Text style={styles.emptyCol}>Bu sütunda görev yok.</Text>
            ) : (
              tasks.map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0f19' },
  column: { margin: 16, marginBottom: 8 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  columnTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  columnCount: { backgroundColor: '#1f2937', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  columnCountText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  emptyCol: { color: '#475569', fontStyle: 'italic', marginBottom: 8, paddingLeft: 4 },
  taskCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priorityBadge: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  assignee: { color: '#64748b', fontSize: 11 },
  taskTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  taskDesc: { color: '#64748b', fontSize: 12, lineHeight: 18, marginBottom: 6 },
  taskDate: { color: '#94a3b8', fontSize: 11, marginBottom: 10 },
  statusBtn: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  statusBtnText: { color: '#818cf8', fontSize: 13, fontWeight: '700' },
});
