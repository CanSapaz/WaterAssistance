import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function CalculationScreen() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1);
  const [calculatedWater, setCalculatedWater] = useState<number | null>(null);

  const calculateDailyWaterGoal = async () => {
    try {
      // Get all stored values with correct keys
      const weight = await AsyncStorage.getItem('user_weight');
      const gender = await AsyncStorage.getItem('gender');
      const activity = await AsyncStorage.getItem('user_activity');
      const climate = await AsyncStorage.getItem('user_climate');

      if (weight && gender && activity && climate) {
        // 1. Base calculation (weight * 33ml)
        let baseWater = parseFloat(weight) * 33;

        // 2. Apply gender multiplier
        const genderMultiplier = gender === 'male' ? 1.1 : 1.0;
        baseWater *= genderMultiplier;

        // 3. Apply activity multiplier
        let activityMultiplier = 1.0;
        switch (activity) {
          case 'sedentary':
            activityMultiplier = 1.0;
            break;
          case 'light':
            activityMultiplier = 1.2;
            break;
          case 'moderate':
            activityMultiplier = 1.4;
            break;
          case 'very_active':
            activityMultiplier = 1.6;
            break;
        }
        baseWater *= activityMultiplier;

        // 4. Apply climate multiplier
        let climateMultiplier = 1.0;
        switch (climate) {
          case 'cold':
            climateMultiplier = 0.9;
            break;
          case 'moderate':
            climateMultiplier = 1.0;
            break;
          case 'hot':
            climateMultiplier = 1.3; // Updated to match climate screen
            break;
        }
        baseWater *= climateMultiplier;

        // Round to nearest 50ml
        const finalWater = Math.round(baseWater / 50) * 50;
        
        // Save and set the calculated value
        await AsyncStorage.setItem('daily_water_goal', finalWater.toString());
        await AsyncStorage.setItem('onboarding_completed', 'true');
        setCalculatedWater(finalWater);

        // After calculation is complete, wait a moment then navigate
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 2000);
      }
    } catch (error) {
      console.error('Error calculating water goal:', error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(timer);
          return 1;
        }
        return prev + 0.1;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 0.3 && step === 1) {
      setStep(2);
    } else if (progress >= 0.6 && step === 2) {
      setStep(3);
    } else if (progress >= 0.9 && step === 3) {
      calculateDailyWaterGoal();
      setStep(4);
    }
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progress * 100}%` as any, {
        damping: 20,
        stiffness: 90,
      }),
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Hesaplanıyor...</Text>
        
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>

        <View style={styles.stepsContainer}>
          <Text style={[styles.step, step >= 1 && styles.activeStep]}>
            Bilgileriniz alınıyor...
          </Text>
          <Text style={[styles.step, step >= 2 && styles.activeStep]}>
            Hesaplamalar yapılıyor...
          </Text>
          <Text style={[styles.step, step >= 3 && styles.activeStep]}>
            Sonuçlar hazırlanıyor...
          </Text>
          {step === 4 && calculatedWater && (
            <Text style={[styles.step, styles.activeStep]}>
              Günlük su hedefiniz: {calculatedWater}ml 🎉
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 40,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  stepsContainer: {
    width: '100%',
    gap: 16,
  },
  step: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  activeStep: {
    color: '#2196F3',
    fontWeight: '500',
  },
});
