import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [waterAmount, setWaterAmount] = useState(0);
  const [dailyGoal] = useState(2000); // 2 litre default hedef

  useEffect(() => {
    loadWaterAmount();
  }, []);

  const loadWaterAmount = async () => {
    try {
      const savedAmount = await AsyncStorage.getItem('waterAmount');
      if (savedAmount !== null) {
        setWaterAmount(parseInt(savedAmount));
      }
    } catch (error) {
      console.error('Error loading water amount:', error);
    }
  };

  const addWater = async (ml) => {
    try {
      const newAmount = waterAmount + ml;
      setWaterAmount(newAmount);
      await AsyncStorage.setItem('waterAmount', newAmount.toString());
    } catch (error) {
      console.error('Error saving water amount:', error);
    }
  };

  const resetWater = async () => {
    try {
      setWaterAmount(0);
      await AsyncStorage.setItem('waterAmount', '0');
    } catch (error) {
      console.error('Error resetting water amount:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.title}>Günlük Su Takibi</Text>
        <Text style={styles.waterAmount}>{waterAmount} ml / {dailyGoal} ml</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              { width: `${Math.min((waterAmount / dailyGoal) * 100, 100)}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => addWater(200)}
        >
          <Text style={styles.buttonText}>200ml Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => addWater(500)}
        >
          <Text style={styles.buttonText}>500ml Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetWater}
        >
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2196F3',
  },
  waterAmount: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  buttonsContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: '#FF5252',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
