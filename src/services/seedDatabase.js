// ─── Database Seed Script ────────────────────────────────────────────────────
// Run this ONCE to populate Firebase with sample data for testing
// Usage: Open this in your app temporarily or use Firebase Console
// ─────────────────────────────────────────────────────────────────────────────

import { database } from './firebaseConfig';
import { ref, set } from 'firebase/database';

/**
 * Seeds Firebase Realtime Database with sample data.
 * This mimics what your ESP32 + ML backend would write.
 * Call this once from the app to set up test data.
 */
export const seedDatabase = async () => {
  try {
    // ── 1. Live Sensor Data (ESP32 writes this) ──────────────────────────
    await set(ref(database, 'sensorData'), {
      temperature: 28.5,
      humidity: 65.2,
      soilMoisture: 45.8,
      soilPH: 6.4,
      chlorophyll: 42.3,
      turbidity: 35.7,
      timestamp: Date.now(),
    });

    // ── 2. Yield Prediction (ML model writes this) ──────────────────────
    await set(ref(database, 'yieldPrediction'), {
      yieldLoss: 18.5,
      riskLevel: 'Medium',
      confidence: 0.87,
      predictedYield: 3250,
      normalYield: 3990,
      timestamp: Date.now(),
    });

    // ── 3. Farm Health Score ─────────────────────────────────────────────
    await set(ref(database, 'farmHealth'), {
      score: 72,
      label: 'Good',
      factors: {
        soilQuality: 75,
        waterQuality: 65,
        cropHealth: 80,
        environmentalStress: 68,
      },
      timestamp: Date.now(),
    });

    // ── 4. Recommendations (ML backend writes) ──────────────────────────
    await set(ref(database, 'recommendations'), {
      rec1: {
        title: 'Increase Irrigation',
        description: 'Soil moisture is below optimal level for rice. Increase watering frequency.',
        priority: 'high',
        icon: 'water-outline',
        category: 'irrigation',
      },
      rec2: {
        title: 'Adjust Soil pH',
        description: 'Soil pH is slightly acidic. Consider adding lime to raise pH to 6.5-7.0.',
        priority: 'medium',
        icon: 'flask-outline',
        category: 'soil',
      },
      rec3: {
        title: 'Monitor Water Quality',
        description: 'Turbidity levels indicate moderate microplastic presence. Filter irrigation water.',
        priority: 'high',
        icon: 'alert-circle-outline',
        category: 'water',
      },
      rec4: {
        title: 'Check Crop Health',
        description: 'Chlorophyll levels are within normal range. Continue current fertilization.',
        priority: 'low',
        icon: 'leaf-outline',
        category: 'crop',
      },
    });

    // ── 5. Alerts ────────────────────────────────────────────────────────
    const now = Date.now();
    await set(ref(database, 'alerts'), {
      alert1: {
        title: 'High Turbidity Detected',
        message: 'Water turbidity has exceeded safe threshold (35.7 NTU). Check water source for contamination.',
        type: 'warning',
        sensor: 'turbidity',
        value: 35.7,
        threshold: 30,
        timestamp: now - 1800000, // 30 min ago
        read: false,
      },
      alert2: {
        title: 'Soil Moisture Low',
        message: 'Soil moisture dropped to 45.8%. Recommended range for rice is 50-90%.',
        type: 'danger',
        sensor: 'soilMoisture',
        value: 45.8,
        threshold: 50,
        timestamp: now - 3600000, // 1 hour ago
        read: false,
      },
      alert3: {
        title: 'Temperature Normal',
        message: 'Temperature has returned to normal range (28.5°C).',
        type: 'info',
        sensor: 'temperature',
        value: 28.5,
        timestamp: now - 7200000, // 2 hours ago
        read: true,
      },
    });

    // ── 6. Sensor History (for charts) ───────────────────────────────────
    const historyData = {};
    for (let i = 0; i < 24; i++) {
      const time = now - (23 - i) * 3600000; // hourly for last 24h
      historyData[`h${i}`] = {
        temperature: 25 + Math.random() * 10,
        humidity: 55 + Math.random() * 25,
        soilMoisture: 35 + Math.random() * 30,
        soilPH: 5.8 + Math.random() * 1.5,
        chlorophyll: 30 + Math.random() * 25,
        turbidity: 15 + Math.random() * 40,
        yieldLoss: 10 + Math.random() * 25,
        timestamp: time,
        hour: new Date(time).getHours() + ':00',
      };
    }
    await set(ref(database, 'sensorHistory'), historyData);

    console.log('✅ Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
};
