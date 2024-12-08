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

const climateOptions = [
  {
    id: 'hot',
    label: 'Sıcak',
    description: '25°C ve üzeri sıcaklıklar',
    multiplier: 1.3
  },
  {
    id: 'moderate',
    label: 'Ilıman',
    description: '15-25°C arası sıcaklıklar',
    multiplier: 1.0
  },
  {
    id: 'cold',
    label: 'Soğuk',
    description: '15°C altı sıcaklıklar',
    multiplier: 0.9
  }
];

export default function ClimateScreen() {
  const [selectedClimate, setSelectedClimate] = useState('');

  const updateWaterGoalWithClimate = async () => {
    try {
      const currentGoal = await AsyncStorage.getItem('daily_water_goal');
      const climate = climateOptions.find(opt => opt.id === selectedClimate);
      
      if (currentGoal && climate) {
        const baseGoal = parseInt(currentGoal);
        const adjustedGoal = Math.round(baseGoal * climate.multiplier);
        await AsyncStorage.setItem('daily_water_goal', adjustedGoal.toString());
      }
    } catch (error) {
      console.error('Error updating water goal with climate:', error);
    }
  };

  const handleContinue = async () => {
    if (selectedClimate) {
      await AsyncStorage.setItem('user_climate', selectedClimate);
      await updateWaterGoalWithClimate();
      router.push('/onboarding/calculation'); // Hesaplama ekranına yönlendir
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>İklim/Hava Durumunu Seçin</Text>
        
        <View style={styles.optionsContainer}>
          {climateOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedClimate === option.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedClimate(option.id)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selectedClimate === option.id && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  selectedClimate === option.id && styles.optionDescriptionSelected,
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
            !selectedClimate && styles.buttonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedClimate}
        >
          <Text style={styles.buttonText}>Hedef Hesapla</Text>
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
