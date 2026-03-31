import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, DEFAULT_THRESHOLDS } from '../constants/theme';
import SensorCard from '../components/SensorCard';
import AlertCard from '../components/AlertCard';
import {
  subscribeSensorData,
  subscribeYieldPrediction,
  subscribeFarmHealth,
  subscribeRecommendations,
  subscribeAlerts,
} from '../services/api';
import { getRiskLevel, formatTimestamp, getHealthColor } from '../utils/helpers';
import { checkAndNotify, notifyYieldLoss, registerForPushNotifications } from '../services/notificationService';
import { subscribeSelectedCrop } from '../services/api';
import { auth } from '../services/firebaseConfig';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [sensorData, setSensorData] = useState({});
  const [yieldData, setYieldData] = useState({});
  const [farmHealth, setFarmHealth] = useState({ score: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('rice');

  // Register push notifications + subscribe to crop selection
  useEffect(() => {
    registerForPushNotifications();
    
    // Subscribe to user's crop choice so notifications use correct thresholds
    const currentUser = auth.currentUser;
    if (currentUser) {
      const unsubCrop = subscribeSelectedCrop(currentUser.uid, (crop) => {
        setSelectedCrop(crop || 'rice');
      });
      return () => unsubCrop();
    }
  }, []);

  // Compute health score client-side from sensor data as a fallback
  const computeLocalHealth = (data) => {
    if (!data || !data.temperature) return 0;
    const thresholds = DEFAULT_THRESHOLDS;
    let scores = [];

    for (const [key, th] of Object.entries(thresholds)) {
      const val = data[key];
      if (val === undefined || val === null) continue;
      const mid = (th.min + th.max) / 2;
      const rng = (th.max - th.min) / 2;
      const deviation = rng > 0 ? Math.abs(val - mid) / rng : 0;
      const score = Math.max(0, 100 - deviation * 50);
      scores.push(score);
    }

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  useEffect(() => {
    const unsubSensors = subscribeSensorData((data) => {
      setSensorData(data || {});
      // Use device time for "Last Updated" text, since ESP32 sends millis()
      setLastUpdated(Date.now()); 

      // Trigger push notifications using crop-specific thresholds
      checkAndNotify(data, selectedCrop);

      // Compute local health score as fallback
      const localScore = computeLocalHealth(data);
      setFarmHealth((prev) => {
        // If we have a fresh score from Firebase, use it
        if (prev.fromFirebase) return prev; 
        return { score: localScore, label: localScore >= 80 ? 'Excellent' : localScore >= 60 ? 'Good' : localScore >= 40 ? 'Fair' : 'Poor' };
      });
    });

    const unsubYield = subscribeYieldPrediction((data) => {
      setYieldData(data || {});
      // Trigger push notification for yield loss
      if (data?.yieldLoss !== undefined && data?.riskLevel) {
        notifyYieldLoss(data.yieldLoss, data.riskLevel);
      }
    });

    const unsubHealth = subscribeFarmHealth((data) => {
      if (data && data.score !== undefined) {
        setFarmHealth({ ...data, fromFirebase: true });
      }
    });

    const unsubRecs = subscribeRecommendations((data) => {
      setRecommendations(data || []);
    });

    const unsubAlerts = subscribeAlerts((data) => {
      setAlerts(data || []);
    });

    return () => {
      unsubSensors();
      unsubYield();
      unsubHealth();
      unsubRecs();
      unsubAlerts();
    };
  }, []);

  const risk = getRiskLevel(yieldData?.yieldLoss || 0);
  const healthColor = getHealthColor(farmHealth?.score || 0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const openSensorDetail = (sensorKey, title, color, unit, icon) => {
    const currentVal = sensorData?.[sensorKey]?.toFixed(1) || '0';
    navigation.navigate('SensorDetail', {
      sensorKey, title, color, unit, icon, currentValue: currentVal,
    });
  };

  const sensors = [
    { key: 'temperature', title: 'Temperature', unit: '°C', icon: 'thermometer-outline', color: '#E67E22' },
    { key: 'humidity', title: 'Humidity', unit: '%', icon: 'water-outline', color: '#3498DB' },
    { key: 'soilMoisture', title: 'Soil Moisture', unit: '%', icon: 'leaf-outline', color: '#27AE60' },
    { key: 'soilPH', title: 'Soil pH', unit: 'pH', icon: 'flask-outline', color: '#8E44AD' },
    { key: 'chlorophyll', title: 'Chlorophyll', unit: 'SPAD', icon: 'sunny-outline', color: '#F1C40F' },
    { key: 'turbidity', title: 'Turbidity', unit: 'NTU', icon: 'analytics-outline', color: '#95A5A6' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🌾 Farm Insights</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: farmHealth.fromFirebase ? '#4CAF50' : '#FF9800' }]} />
              <Text style={styles.statusText}>{farmHealth.fromFirebase ? 'ML Bridge Online' : 'Local Fallback Active'}</Text>
            </View>
          </View>
          <View style={styles.healthScoreContainer}>
            <View style={[styles.healthCircle, { borderColor: healthColor }]}>
              <Text style={[styles.healthScore, { color: healthColor }]}>
                {Math.round(farmHealth?.score || 0)}
              </Text>
              <Text style={styles.healthLabel}>Health</Text>
            </View>
          </View>
        </View>

        <View style={[styles.yieldContainer, { backgroundColor: risk.bgColor }]}>
          <View style={styles.yieldLeft}>
            <Text style={styles.yieldLabel}>Yield Loss Prediction</Text>
            <Text style={[styles.yieldValue, { color: risk.color }]}>
              {yieldData?.yieldLoss?.toFixed(1) || '0.0'}%
            </Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: risk.color }]}>
            <Text style={styles.riskEmoji}>{risk.emoji}</Text>
            <Text style={styles.riskLabelText}>{risk.level} Risk</Text>
          </View>
        </View>

        <Text style={styles.timestamp}>
          {farmHealth.fromFirebase ? 'Live ML Stream' : 'Awaiting Bridge connection...'} • Last updated: {formatTimestamp(lastUpdated)}
        </Text>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitleContent}>Active Alerts ({alerts.length})</Text>
            {alerts.slice(0, 3).map((alert) => (
              <AlertCard 
                key={alert.id}
                title={alert.title}
                message={alert.message}
                type={alert.type || 'warning'}
                timestamp={alert.timestamp}
              />
            ))}
          </View>
        )}

        {recommendations.length > 0 && (
          <View style={styles.recCard}>
            <LinearGradient
              colors={['#E8F5E9', '#FFFFFF']}
              style={styles.recGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.recHeader}>
                <Ionicons name="bulb-outline" size={24} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Next Best Action</Text>
              </View>
              <Text style={styles.recTitle}>{Object.values(recommendations)[0].title}</Text>
              <Text style={styles.recText}>{Object.values(recommendations)[0].description}</Text>
            </LinearGradient>
          </View>
        )}

        <Text style={styles.sectionTitleContent}>Real-Time Sensor Grid</Text>
        <Text style={styles.tapHintText}>Tap any card to view historical graph 📈</Text>
        <View style={styles.grid}>
          {sensors.map((s) => (
            <SensorCard
              key={s.key}
              title={s.title}
              value={sensorData?.[s.key]?.toFixed(1) || '--'}
              unit={s.unit}
              icon={s.icon}
              color={s.color}
              onPress={() => openSensorDetail(s.key, s.title, s.color, s.unit, s.icon)}
            />
          ))}
        </View>

        <View style={styles.proxyDisclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.proxyText}>Microplastic data is based on turbidity proxy estimation.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, ...SHADOWS.md,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  healthScoreContainer: {
    width: 70, height: 70, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 35, justifyContent: 'center', alignItems: 'center',
  },
  healthCircle: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 3,
    justifyContent: 'center', alignItems: 'center',
  },
  healthScore: { fontSize: 20, fontWeight: '800' },
  healthLabel: { fontSize: 8, color: '#FFFFFF', fontWeight: '700', textTransform: 'uppercase' },
  yieldContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, marginTop: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  yieldLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  yieldValue: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  riskBadge: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    paddingHorizontal: 12, borderRadius: 20, gap: 6,
  },
  riskEmoji: { fontSize: 18 },
  riskLabelText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  timestamp: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 15 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  sectionTitleContent: {
    fontSize: 18, fontWeight: '700', color: COLORS.textPrimary,
    marginBottom: SPACING.sm, marginTop: SPACING.lg,
  },
  tapHintText: { fontSize: 12, color: COLORS.textMuted, marginBottom: SPACING.md, fontStyle: 'italic' },
  alertsSection: { marginBottom: SPACING.md },
  recCard: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm, marginBottom: SPACING.md },
  recGradient: { padding: SPACING.lg },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  recTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  recText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  proxyDisclaimer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: SPACING.xl, gap: 6, opacity: 0.7,
  },
  proxyText: { fontSize: 11, color: COLORS.textSecondary, fontStyle: 'italic' },
});

export default DashboardScreen;
