// React Native – ProjectsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { mobileApi } from '../services/api';

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await mobileApi.getProjects();
      if (res.success) setProjects(res.projects);
    } catch (err) {
      console.error('Projeler yüklenemedi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProjects(); }} tintColor="#6366f1" />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Henüz projeniz yok. Bir proje oluşturun!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: item.color || '#6366f1' }]}
            onPress={() => navigation.navigate('Board', { projectId: item.id, projectTitle: item.title })}
          >
            <View style={[styles.colorDot, { backgroundColor: item.color || '#6366f1' }]} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0f19' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 16 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 14 },
  cardContent: { flex: 1 },
  cardTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: '#64748b', fontSize: 13, lineHeight: 18 },
  arrow: { color: '#475569', fontSize: 24, fontWeight: '300' },
});
