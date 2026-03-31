// ─── App Entry Point ─────────────────────────────────────────────────────────
// Soil-Plant Physiological Coupling System
// Manages Firebase Auth state → shows Login or Main App
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToAuthState } from './src/services/authService';
import { logoutUser } from './src/services/authService';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    // This fires when user logs in, signs up, or logs out
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Auth state listener above will set user to null
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ── Splash / Loading Screen ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#388E3C']}
        style={styles.splash}
      >
        <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
        <Ionicons name="leaf" size={64} color="#FFFFFF" />
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={styles.spinner}
        />
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
      {user ? (
        <AppNavigator onLogout={handleLogout} user={user} />
      ) : (
        <LoginScreen />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginTop: 24,
  },
});
