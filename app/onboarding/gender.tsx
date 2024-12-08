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
import { MaterialCommunityIcons } from '@expo/vector-icons';

type GenderOption = {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  multiplier: number;
};

const genderOptions: GenderOption[] = [
  {
    id: 'male',
    title: 'Erkek',
    icon: 'gender-male',
    multiplier: 1.1,
  },
  {
    id: 'female',
    title: 'Kadın',
    icon: 'gender-female',
    multiplier: 1.0,
  },
  {
    id: 'pregnant',
    title: 'Kadın: Hamile',
    icon: 'gender-female',
    multiplier: 1.1,
  },
  {
    id: 'nursing',
    title: 'Kadın: Emziren',
    icon: 'gender-female',
    multiplier: 1.2,
  },
  {
    id: 'other',
    title: 'Diğer',
    icon: 'gender-male-female',
    multiplier: 1.0,
  },
];

export default function GenderScreen() {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const handleContinue = async () => {
    if (selectedGender) {
      const option = genderOptions.find(opt => opt.id === selectedGender);
      if (option) {
        try {
          await AsyncStorage.setItem('gender', selectedGender);
          await AsyncStorage.setItem('gender_multiplier', option.multiplier.toString());
          router.push('/onboarding/weight');
        } catch (error) {
          console.error('Error saving gender:', error);
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>Cinsiyetiniz</Text>
        
        <View style={styles.optionsContainer}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedGender === option.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedGender(option.id)}
            >
              <View style={styles.optionContent}>
                <MaterialCommunityIcons
                  name={option.icon}
                  size={24}
                  color={selectedGender === option.id ? '#2196F3' : '#333'}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    selectedGender === option.id && styles.optionLabelSelected,
                  ]}
                >
                  {option.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            !selectedGender && styles.buttonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedGender}
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
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionLabelSelected: {
    color: '#2196F3',
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
