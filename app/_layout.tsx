import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
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
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}
