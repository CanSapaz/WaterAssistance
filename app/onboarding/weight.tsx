import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WeightScreen() {
  const [weight, setWeight] = useState('');

  const handleContinue = async () => {
    if (weight.trim() && !isNaN(Number(weight))) {
      await AsyncStorage.setItem('user_weight', weight.trim());
      router.push('/onboarding/activity'); // Aktivite ekranına yönlendir
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.question}>Kilonuz kaç?</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={(text) => setWeight(text.replace(/[^0-9]/g, ''))}
              placeholder="Kilonuzu girin"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unit}>kg</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!weight.trim() || isNaN(Number(weight))) && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={!weight.trim() || isNaN(Number(weight))}
          >
            <Text style={styles.buttonText}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -60,
  },
  input: {
    fontSize: 42,
    textAlign: 'center',
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    paddingVertical: 10,
    minWidth: 120,
  },
  unit: {
    fontSize: 24,
    color: '#666',
    marginLeft: 10,
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
