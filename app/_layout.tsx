import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/auth';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const useBiometric = await AsyncStorage.getItem('useBiometric');
      
      if (useBiometric === 'true') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Lütfen kimliğinizi doğrulayın',
          cancelLabel: 'İptal',
          disableDeviceFallback: true,
        });

        setIsAuthenticated(result.success);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Kimlik doğrulama hatası:', error);
      Alert.alert('Hata', 'Kimlik doğrulama sırasında bir hata oluştu');
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4facfe" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4facfe" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack 
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="onboarding/name" />
          <Stack.Screen name="onboarding/gender" />
          <Stack.Screen name="onboarding/weight" />
          <Stack.Screen name="onboarding/activity" />
          <Stack.Screen name="onboarding/climate" />
          <Stack.Screen name="onboarding/calculation" />
          <Stack.Screen name="onboarding/result" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="index" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
