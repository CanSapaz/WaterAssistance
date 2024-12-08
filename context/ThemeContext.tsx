import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

export const lightColors = {
  background: '#FFFFFF',
  text: '#333333',
  primary: '#2196F3',
  secondary: '#666666',
  card: '#F5F5F5',
  cardBorder: '#E0E0E0',
  buttonText: '#FFFFFF',
  disabledButton: '#B0BEC5',
  progressBar: '#E0E0E0',
  progressFill: '#2196F3',
  error: '#F44336',
  warning: '#FFC107',
};

export const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  primary: '#2196F3',
  secondary: '#B0BEC5',
  card: '#1E1E1E',
  cardBorder: '#333333',
  buttonText: '#FFFFFF',
  disabledButton: '#424242',
  progressBar: '#333333',
  progressFill: '#2196F3',
  error: '#EF5350',
  warning: '#FFB300',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    // Load saved theme preference
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
