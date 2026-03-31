// ─── Push Notification Service ───────────────────────────────────────────────
// Handles local push notifications for sensor alerts

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THRESHOLDS, CROP_THRESHOLDS } from '../constants/theme';

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get the Expo push token
 */
export const registerForPushNotifications = async () => {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted.');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
  } else {
    console.log('Must use physical device for push notifications');
  }

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('sensor-alerts', {
      name: 'Sensor Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  return token;
};

/**
 * Send a local push notification
 */
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    // Check if notifications are enabled
    const enabled = await AsyncStorage.getItem('notifications_enabled');
    if (enabled === 'false') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'sensor-alerts' }),
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

/**
 * Check sensor data against crop-specific thresholds and send alerts.
 * @param {Object} sensorData - Live sensor readings
 * @param {string} cropId - Selected crop (e.g. 'rice', 'wheat'). Uses crop-specific thresholds.
 */
let lastAlertTimestamps = {};

export const checkAndNotify = async (sensorData, cropId = 'rice') => {
  if (!sensorData) return;

  const now = Date.now();
  const COOLDOWN = 60000; // Don't repeat same alert within 60 seconds

  // Use crop-specific thresholds if available, fallback to defaults
  const cropThresholds = CROP_THRESHOLDS[cropId] || DEFAULT_THRESHOLDS;

  const checks = [
    { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
    { key: 'humidity', label: 'Humidity', unit: '%', icon: '💧' },
    { key: 'soilMoisture', label: 'Soil Moisture', unit: '%', icon: '🌱' },
    { key: 'soilPH', label: 'Soil pH', unit: 'pH', icon: '🧪' },
    { key: 'chlorophyll', label: 'Chlorophyll', unit: 'SPAD', icon: '☀️' },
    { key: 'turbidity', label: 'Turbidity', unit: 'NTU', icon: '🔬' },
  ];

  for (const check of checks) {
    const value = sensorData[check.key];
    if (value === undefined || value === null) continue;

    const threshold = cropThresholds[check.key];
    if (!threshold) continue;

    const alertKey = check.key;

    if (value < threshold.min) {
      if (!lastAlertTimestamps[alertKey] || now - lastAlertTimestamps[alertKey] > COOLDOWN) {
        lastAlertTimestamps[alertKey] = now;
        await sendLocalNotification(
          `${check.icon} Low ${check.label} Alert`,
          `${check.label} dropped to ${value.toFixed(1)}${check.unit}. Safe range for your crop: ${threshold.min}-${threshold.max}${check.unit}.`,
          { sensor: check.key, value, crop: cropId }
        );
      }
    } else if (value > threshold.max) {
      if (!lastAlertTimestamps[alertKey] || now - lastAlertTimestamps[alertKey] > COOLDOWN) {
        lastAlertTimestamps[alertKey] = now;
        await sendLocalNotification(
          `${check.icon} High ${check.label} Alert`,
          `${check.label} rose to ${value.toFixed(1)}${check.unit}. Safe range for your crop: ${threshold.min}-${threshold.max}${check.unit}.`,
          { sensor: check.key, value, crop: cropId }
        );
      }
    }
  }
};

/**
 * Send yield loss notification
 */
export const notifyYieldLoss = async (yieldLoss, riskLevel) => {
  if (!yieldLoss || yieldLoss < 15) return; // Only notify for Medium+ risk

  const lastYieldAlert = lastAlertTimestamps['yieldLoss'];
  const now = Date.now();
  if (lastYieldAlert && now - lastYieldAlert < 120000) return; // 2 min cooldown

  lastAlertTimestamps['yieldLoss'] = now;

  const emoji = riskLevel === 'High' ? '🚨' : '⚠️';
  await sendLocalNotification(
    `${emoji} ${riskLevel} Yield Loss Risk`,
    `Predicted yield loss: ${yieldLoss.toFixed(1)}%. Take corrective action on flagged sensors.`,
    { type: 'yield', yieldLoss, riskLevel }
  );
};
