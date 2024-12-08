import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const activityOptions = [
  {
    id: 'sedentary',
    label: 'Hareketsiz',
    description: 'Masa başı iş, az hareket',
    multiplier: 1.0
  },
  {
    id: 'light',
    label: 'Hafif Aktivite',
    description: 'Günlük yürüyüş, hafif egzersiz',
    multiplier: 1.2
  },
  {
    id: 'moderate',
    label: 'Kısmen Aktif',
    description: 'Düzenli egzersiz, aktif yaşam',
    multiplier: 1.4
  },
  {
    id: 'very_active',
    label: 'Çok Aktif',
    description: 'Yoğun egzersiz, spor',
    multiplier: 1.6
  },
];

export default function ActivityScreen() {
  const [selectedActivity, setSelectedActivity] = useState('');

  const calculateDailyWaterGoal = async () => {
    try {
      const weight = await AsyncStorage.getItem('user_weight');
      const gender = await AsyncStorage.getItem('user_gender');
      const activity = activityOptions.find(opt => opt.id === selectedActivity);
      
      if (weight && gender && activity) {
        // Temel su ihtiyacı: Kilo * 0.033 litre
        let baseWater = parseFloat(weight) * 33; // ml cinsinden
        
        // Cinsiyet faktörü
        const genderMultiplier = gender === 'female' ? 0.9 : 1.0;
        
        // Aktivite faktörü
        const activityMultiplier = activity.multiplier;
        
        // Toplam günlük su ihtiyacı
        const dailyWater = Math.round(baseWater * genderMultiplier * activityMultiplier);
        
        await AsyncStorage.setItem('daily_water_goal', dailyWater.toString());
      }
    } catch (error) {
      console.error('Error calculating water goal:', error);
    }
  };

  const handleContinue = async () => {
    if (selectedActivity) {
      await AsyncStorage.setItem('user_activity', selectedActivity);
      await calculateDailyWaterGoal();
      router.push('/onboarding/climate'); // İklim ekranına yönlendir
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>Aktivite Düzeyiniz?</Text>
        
        <View style={styles.optionsContainer}>
          {activityOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedActivity === option.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedActivity(option.id)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selectedActivity === option.id && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  selectedActivity === option.id && styles.optionDescriptionSelected,
                ]}
              >
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            !selectedActivity && styles.buttonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedActivity}
        >
          <Text style={styles.buttonText}>Devam Et</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingTop: '20%',
    paddingBottom: 40,
  },
  question: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  optionButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#2196F3',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionSelected: {
    color: '#1976D2',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
