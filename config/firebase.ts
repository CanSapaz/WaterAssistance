import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDZHHKN1HMIZGXCkqzXqQYdkZEKzNgNGxI",
  authDomain: "water-assistance.firebaseapp.com",
  projectId: "water-assistance",
  storageBucket: "water-assistance.appspot.com",
  messagingSenderId: "1041836499664",
  appId: "1:1041836499664:web:b7b9d2c5c7d9b2b0b0b0b0",
  databaseURL: "https://water-assistance-default-rtdb.europe-west1.firebasedatabase.app"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth ve Database servislerini al
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
