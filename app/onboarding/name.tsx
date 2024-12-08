import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function NameScreen() {
  const [name, setName] = useState('');

  const handleContinue = async () => {
    if (name.trim()) {
      try {
        // Anonim oturum aç
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;

        // Kullanıcı bilgilerini Firestore'a kaydet
        await setDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          createdAt: new Date(),
        });

        // AsyncStorage'a da kaydet
        await AsyncStorage.setItem('user_name', name.trim());
        
        console.log('User created with ID:', user.uid);
        router.push('/onboarding/gender');
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.question}>Adın ne?</Text>
      
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Adınızı girin"
        placeholderTextColor="#A0A0A0"
      />

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Devam Et</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'space-between',
  },
  question: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 100,
  },
  input: {
    fontSize: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    paddingVertical: 10,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 50,
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
