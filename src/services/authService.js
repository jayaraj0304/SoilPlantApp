// ─── Authentication Service ──────────────────────────────────────────────────
// Handles Firebase Auth operations
// ─────────────────────────────────────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from './firebaseConfig';

/**
 * Register a new user with email & password
 */
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Realtime Database
    await set(ref(database, `users/${user.uid}`), {
      email: user.email,
      displayName: displayName,
      selectedCrop: 'rice',
      createdAt: Date.now(),
    });

    return user;
  } catch (error) {
    throw formatAuthError(error);
  }
};

/**
 * Sign in with email & password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw formatAuthError(error);
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw formatAuthError(error);
  }
};

/**
 * Get current user profile from database
 */
export const getUserProfile = async (uid) => {
  try {
    const snapshot = await get(ref(database, `users/${uid}`));
    return snapshot.val();
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Format Firebase auth error codes into user-friendly messages
 */
const formatAuthError = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password login is not enabled. Contact admin.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.',
  };

  const message = errorMessages[error.code] || error.message || 'Authentication failed.';
  return new Error(message);
};
