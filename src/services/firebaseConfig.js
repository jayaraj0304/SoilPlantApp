// ─── Firebase Configuration ──────────────────────────────────────────────────
// Soil-Plant Physiological Coupling System
// Connected to: soilplant-fe521
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB203V6rxUVAD_NH8KsN_eMUdp2JrcEcj8',
  authDomain: 'soilplant-fe521.firebaseapp.com',
  databaseURL: 'https://soilplant-fe521-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'soilplant-fe521',
  storageBucket: 'soilplant-fe521.firebasestorage.app',
  messagingSenderId: '761362980987',
  appId: '1:761362980987:web:f2737641b462cd7f5202de',
  measurementId: 'G-HZGQ7KZXN1',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence (keeps user logged in across app restarts)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Realtime Database (for live sensor data from ESP32)
const database = getDatabase(app);

// Initialize Firestore (optional — for structured data like user profiles, alerts history)
const firestore = getFirestore(app);

export { app, auth, database, firestore };
