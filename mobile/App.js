// React Native Mobile App – App.js
// Temel navigasyon ve ekran yapısı (Expo tabanlı)
// Gerçek proje için: npx create-expo-app@latest mobile

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './src/screens/LoginScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import BoardScreen from './src/screens/BoardScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0f19' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#111827' },
        headerTintColor: '#f8fafc',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Projects" component={ProjectsScreen} options={{ title: '🗂️ Projelerim' }} />
          <Stack.Screen name="Board" component={BoardScreen} options={({ route }) => ({ title: route.params?.projectTitle || 'Pano' })} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
