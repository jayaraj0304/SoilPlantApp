// ─── Firebase API Service ────────────────────────────────────────────────────
// Handles all reads/writes to Firebase Realtime Database
// ─────────────────────────────────────────────────────────────────────────────

import { database } from './firebaseConfig';
import { ref, onValue, set, off } from 'firebase/database';

/**
 * Subscribe to real-time sensor data updates
 * @param {Function} callback - called with sensor data on each update
 * @returns {Function} unsubscribe function
 */
export const subscribeSensorData = (callback) => {
  const sensorRef = ref(database, 'sensorData');
  const listener = onValue(
    sensorRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    },
    (error) => {
      console.error('Failed to read sensor data:', error);
    }
  );

  // Return unsubscribe function
  return () => off(sensorRef);
};

/**
 * Subscribe to yield prediction data
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export const subscribeYieldPrediction = (callback) => {
  const yieldRef = ref(database, 'yieldPrediction');
  const listener = onValue(
    yieldRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    },
    (error) => {
      console.error('Failed to read yield data:', error);
    }
  );

  return () => off(yieldRef);
};

/**
 * Subscribe to alerts
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export const subscribeAlerts = (callback) => {
  const alertsRef = ref(database, 'alerts');
  onValue(
    alertsRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const alertsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        callback(alertsArray.reverse());
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Failed to read alerts:', error);
    }
  );

  return () => off(ref(database, 'alerts'));
};

/**
 * Subscribe to recommendations
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export const subscribeRecommendations = (callback) => {
  const recRef = ref(database, 'recommendations');
  onValue(
    recRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recArray = Array.isArray(data)
          ? data
          : Object.values(data);
        callback(recArray);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Failed to read recommendations:', error);
    }
  );

  return () => off(recRef);
};

/**
 * Subscribe to sensor history for charts
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export const subscribeSensorHistory = (callback) => {
  const historyRef = ref(database, 'sensorHistory');
  onValue(
    historyRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const historyArray = Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        callback(historyArray);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Failed to read sensor history:', error);
    }
  );

  return () => off(historyRef);
};

/**
 * Set the selected crop in Firebase
 * @param {string} userId
 * @param {string} cropId
 */
export const setSelectedCrop = async (userId, cropId) => {
  try {
    await set(ref(database, `users/${userId}/selectedCrop`), cropId);
  } catch (error) {
    console.error('Failed to set crop:', error);
    throw error;
  }
};

/**
 * Subscribe to user's selected crop
 * @param {string} userId
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export const subscribeSelectedCrop = (userId, callback) => {
  const cropRef = ref(database, `users/${userId}/selectedCrop`);
  onValue(cropRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || 'rice'); // Default to rice
  });

  return () => off(cropRef);
};

/**
 * Subscribe to farm health score
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export const subscribeFarmHealth = (callback) => {
  const healthRef = ref(database, 'farmHealth');
  onValue(
    healthRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    },
    (error) => {
      console.error('Failed to read farm health:', error);
    }
  );

  return () => off(healthRef);
};

/**
 * Clear all alerts from the database
 */
export const clearAlerts = async () => {
  try {
    const alertsRef = ref(database, 'alerts');
    await set(alertsRef, null);
  } catch (error) {
    console.error('Failed to clear alerts:', error);
    throw error;
  }
};

/**
 * Clear all sensor history from the database
 */
export const clearSensorHistory = async () => {
  try {
    const historyRef = ref(database, 'sensorHistory');
    await set(historyRef, null);
  } catch (error) {
    console.error('Failed to clear sensor history:', error);
    throw error;
  }
};
