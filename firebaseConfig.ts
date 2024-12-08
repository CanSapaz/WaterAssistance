import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbdEoeBfqtHn5J7zmImL-DLr9-TXTlhoo",
  authDomain: "waterassistance-4ce5c.firebaseapp.com",
  projectId: "waterassistance-4ce5c",
  storageBucket: "waterassistance-4ce5c.firebasestorage.app",
  messagingSenderId: "645634224417",
  appId: "1:645634224417:web:24a6d84e6af250625bce60",
  databaseURL: "https://waterassistance-4ce5c-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Initialize Auth with persistence only on first initialization
  initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  app = getApp();
}

// Get Auth instance
const auth = getAuth(app);

// Get other Firebase services
const db = getFirestore(app);
const database = getDatabase(app);

export { auth, db, database };
export default app;
