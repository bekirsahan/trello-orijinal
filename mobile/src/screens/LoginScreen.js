// React Native – LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Email ve şifre gerekli.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.logo}>✓ AuraTask</Text>
        <Text style={styles.subtitle}>Görev yönetimine hoş geldiniz</Text>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Giriş Yap</Text>}
        </TouchableOpacity>

        {/* Demo Hızlı Giriş */}
        <View style={styles.demoRow}>
          <TouchableOpacity style={styles.demoBtn} onPress={() => { setEmail('user@example.com'); setPassword('user123'); }}>
            <Text style={styles.demoBtnText}>👤 Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoBtn} onPress={() => { setEmail('admin@example.com'); setPassword('admin123'); }}>
            <Text style={styles.demoBtnText}>🛡️ Admin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  error: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    color: '#f87171',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    color: '#f8fafc',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  btn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  demoBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
});
