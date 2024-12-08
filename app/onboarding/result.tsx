import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebaseConfig';
import { ref, set } from 'firebase/database';
import { useAuth } from '../../context/auth';

export default function ResultScreen() {
  const [dailyGoal, setDailyGoal] = useState<string>('');
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);
  const { user } = useAuth();

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goal = await AsyncStorage.getItem('daily_water_goal');
        const gender = await AsyncStorage.getItem('user_gender');
        const weight = await AsyncStorage.getItem('user_weight');
        const activity = await AsyncStorage.getItem('user_activity');
        const climate = await AsyncStorage.getItem('user_climate');
        const name = await AsyncStorage.getItem('user_name');

        if (goal) {
          setDailyGoal(goal);

          // Firebase Realtime Database'e kullanıcı bilgilerini kaydet
          if (user?.uid) {
            const userRef = ref(database, `users/${user.uid}`);
            await set(userRef, {
              dailyGoal: parseInt(goal),
              gender,
              weight: weight ? parseFloat(weight) : null,
              activity,
              climate,
              name,
              updatedAt: new Date().toISOString()
            });
            console.log('User data updated in Firebase Realtime Database');
          }
        }
      } catch (error) {
        console.error('Error loading daily goal:', error);
        setDailyGoal('2000'); // Varsayılan değer
      }
    };

    loadGoal();
    
    // Paralel animasyonlar
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user]);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.resultContainer}>
          <Text style={styles.title}>Günlük Hedefiniz</Text>
          <View style={styles.goalContainer}>
            <Text style={styles.goalText}>{dailyGoal}</Text>
            <Text style={styles.unitText}>ml</Text>
          </View>
          <Text style={styles.description}>
            Size özel hesaplanan günlük su tüketim hedefiniz.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Devam Et</Text>
        </TouchableOpacity>
      </Animated.View>
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
    padding: 20,
    justifyContent: 'space-between',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 30,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  goalText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
  },
  unitText: {
    fontSize: 24,
    color: '#666',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
