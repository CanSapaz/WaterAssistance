import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
}

export default function HomeScreen() {
  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(2000);
  const [userName, setUserName] = useState<string>('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const progressAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;
  const waveAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;
  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('user_name');
      const goal = await AsyncStorage.getItem('daily_water_goal');
      const amount = await AsyncStorage.getItem('water_amount');
      
      if (name) setUserName(name);
      if (goal) setDailyGoal(parseInt(goal));
      if (amount) setWaterAmount(parseInt(amount));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const addWater = async (amount: number) => {
    try {
      const newAmount = waterAmount + amount;
      setWaterAmount(newAmount);
      await AsyncStorage.setItem('water_amount', newAmount.toString());
      
      // Achievement check
      checkAchievements(newAmount);
    } catch (error) {
      console.error('Error updating water amount:', error);
    }
  };

  const resetWater = async () => {
    try {
      setWaterAmount(0);
      await AsyncStorage.setItem('water_amount', '0');
    } catch (error) {
      console.error('Error resetting water amount:', error);
    }
  };

  const checkAchievements = (amount: number) => {
    const newAchievements: Achievement[] = [];
    
    if (amount >= dailyGoal && !achievements.some(a => a.id === 'daily_goal')) {
      newAchievements.push({
        id: 'daily_goal',
        title: 'Günlük Hedef Başarılı!',
        description: 'Günlük su hedefinize ulaştınız.'
      });
    }
    
    if (amount >= 3000 && !achievements.some(a => a.id === 'hydration_master')) {
      newAchievements.push({
        id: 'hydration_master',
        title: 'Hidrasyon Uzmanı',
        description: '3 litre su içtiniz!'
      });
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const resetAllAndGoToOnboarding = async () => {
    try {
      await AsyncStorage.multiRemove([
        'user_name',
        'gender',
        'gender_multiplier',
        'user_weight',
        'user_activity',
        'user_climate',
        'daily_water_goal',
        'water_amount',
        'onboarding_completed'
      ]);
      router.replace('/onboarding/name');
    } catch (error) {
      console.error('Error resetting app:', error);
    }
  };

  // Progress bar animation
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, dailyGoal],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // Wave animation
  const waveTranslate = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: waterAmount,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [waterAmount]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Merhaba, {userName}!</Text>
            <Text style={[styles.dateText, { color: colors.secondary }]}>
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.themeToggle}
          >
            <MaterialCommunityIcons
              name={theme === 'light' ? 'weather-night' : 'weather-sunny'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.goalLabel, { color: colors.secondary }]}>
            Günlük İlerleme
          </Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progress,
                { width: progressWidth, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <View style={styles.waterInfo}>
            <Text style={[styles.waterAmount, { color: colors.primary }]}>{waterAmount} ml</Text>
            <Text style={[styles.waterGoal, { color: colors.secondary }]}>/ {dailyGoal} ml</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => addWater(200)}
          >
            <Ionicons name="water" size={24} color={colors.buttonText} />
            <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>200ml</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => addWater(500)}
          >
            <Ionicons name="water" size={24} color={colors.buttonText} />
            <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>500ml</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={resetWater}
          >
            <Ionicons name="refresh" size={24} color={colors.buttonText} />
            <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.warning }]}
          onPress={resetAllAndGoToOnboarding}
        >
          <Ionicons name="refresh" size={24} color={colors.buttonText} />
          <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>
            Test: Başlangıç Ekranına Dön
          </Text>
        </TouchableOpacity>

        {achievements.length > 0 && (
          <View style={styles.achievements}>
            <Text style={[styles.achievementsTitle, { color: colors.primary }]}>
              Başarılar
            </Text>
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[styles.achievementCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <Text style={[styles.achievementTitle, { color: colors.primary }]}>
                  {achievement.title}
                </Text>
                <Text style={[styles.achievementDesc, { color: colors.text }]}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    marginTop: 5,
  },
  themeToggle: {
    padding: 8,
  },
  goalCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  goalLabel: {
    fontSize: 16,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progress: {
    height: '100%',
  },
  waterInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
  },
  waterAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  waterGoal: {
    fontSize: 18,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetButton: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievements: {
    padding: 20,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  achievementDesc: {
    fontSize: 14,
  },
});
