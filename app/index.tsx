import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      setIsOnboardingCompleted(onboardingCompleted === 'true');
    } catch (error) {
      setIsOnboardingCompleted(false);
    }
  };

  if (isOnboardingCompleted === null) {
    return null; // Loading state
  }

  if (!isOnboardingCompleted) {
    return <Redirect href="/onboarding/name" />;
  }

  return <Redirect href="/(tabs)/home" />;
}