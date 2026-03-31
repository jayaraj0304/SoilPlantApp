// ─── Settings Screen — Full Production Features ─────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, CROPS, CROP_THRESHOLDS } from '../constants/theme';
import { setSelectedCrop, subscribeSelectedCrop, clearAlerts, clearSensorHistory } from '../services/api';

const SettingsScreen = ({ onLogout, user }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedCropId, setSelectedCropId] = useState('rice');
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [thresholdModalVisible, setThresholdModalVisible] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const notifPref = await AsyncStorage.getItem('notifications_enabled');
        if (notifPref !== null) setNotificationsEnabled(notifPref === 'true');
      } catch (e) { /* ignore */ }
    };
    loadPrefs();

    // Subscribe to crop selection from Firebase
    if (user?.uid) {
      const unsub = subscribeSelectedCrop(user.uid, (crop) => {
        setSelectedCropId(crop || 'rice');
      });
      return () => unsub();
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notifications_enabled', value.toString());
    if (value) {
      Alert.alert('🔔 Notifications Enabled', 'You will receive alerts when sensor values exceed thresholds.');
    } else {
      Alert.alert('🔕 Notifications Disabled', 'You will no longer receive push notifications for alerts.');
    }
  };

  const handleCropSelect = async (cropId) => {
    setSelectedCropId(cropId);
    setCropModalVisible(false);
    if (user?.uid) {
      try {
        await setSelectedCrop(user.uid, cropId);
        const crop = CROPS.find(c => c.id === cropId);
        Alert.alert('🌱 Crop Updated', `Thresholds set for ${crop?.label || cropId}.`);
      } catch (e) {
        Alert.alert('Error', 'Failed to update crop selection.');
      }
    }
  };

  const handleClearAlerts = () => {
    Alert.alert(
      'Clear All Alerts',
      'This will remove all current alerts from your dashboard. New alerts will still be generated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAlerts();
              Alert.alert('✅ Done', 'All alerts have been cleared.');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear alerts.');
            }
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Sensor History',
      'This will remove all historical sensor data used for graphs. New data will continue to be recorded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearSensorHistory();
              Alert.alert('✅ Done', 'Sensor history cleared.');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear history.');
            }
          },
        },
      ]
    );
  };

  const currentCrop = CROPS.find(c => c.id === selectedCropId) || CROPS[0];
  const thresholds = CROP_THRESHOLDS[selectedCropId] || CROP_THRESHOLDS.rice;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <Text style={styles.headerSubtitle}>App Configuration</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || 'Farmer'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Not logged in'}</Text>
          </View>
        </View>

        {/* Section: Farm Settings */}
        <Text style={styles.sectionLabel}>FARM SETTINGS</Text>

        {/* Crop Selection */}
        <TouchableOpacity style={styles.menuItem} onPress={() => setCropModalVisible(true)}>
          <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryLight + '15' }]}>
            <Text style={{ fontSize: 22 }}>{currentCrop.icon}</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Crop Type</Text>
            <Text style={styles.menuSubtitle}>{currentCrop.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* View Thresholds */}
        <TouchableOpacity style={styles.menuItem} onPress={() => setThresholdModalVisible(true)}>
          <View style={[styles.menuIcon, { backgroundColor: '#8E44AD15' }]}>
            <Ionicons name="speedometer-outline" size={22} color="#8E44AD" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Sensor Thresholds</Text>
            <Text style={styles.menuSubtitle}>View safe ranges for {currentCrop.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Section: Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>

        {/* Push Notifications Toggle */}
        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: COLORS.accent + '15' }]}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.accent} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Push Alerts</Text>
            <Text style={styles.menuSubtitle}>
              {notificationsEnabled ? 'Alerts are active' : 'Alerts are muted'}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#E0E0E0', true: COLORS.primary + '60' }}
            thumbColor={notificationsEnabled ? COLORS.primary : '#FFF'}
          />
        </View>

        {/* Section: Data Management */}
        <Text style={styles.sectionLabel}>DATA MANAGEMENT</Text>

        {/* Clear Alerts */}
        <TouchableOpacity style={styles.menuItem} onPress={handleClearAlerts}>
          <View style={[styles.menuIcon, { backgroundColor: COLORS.warning + '15' }]}>
            <Ionicons name="trash-outline" size={22} color={COLORS.warning} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Clear All Alerts</Text>
            <Text style={styles.menuSubtitle}>Remove existing alert notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Clear Sensor History */}
        <TouchableOpacity style={styles.menuItem} onPress={handleClearHistory}>
          <View style={[styles.menuIcon, { backgroundColor: COLORS.danger + '15' }]}>
            <Ionicons name="bar-chart-outline" size={22} color={COLORS.danger} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Clear Sensor History</Text>
            <Text style={styles.menuSubtitle}>Reset graph data</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Section: About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>

        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: COLORS.info + '15' }]}>
            <Ionicons name="information-circle-outline" size={22} color={COLORS.info} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Soil-Plant Coupling System</Text>
            <Text style={styles.menuSubtitle}>v1.0.0 — IoT + ML + Mobile</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── Crop Selection Modal ─── */}
      <Modal visible={cropModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Crop</Text>
            <Text style={styles.modalSubtitle}>Thresholds will adjust automatically</Text>
            {CROPS.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[
                  styles.cropOption,
                  selectedCropId === crop.id && styles.cropOptionActive,
                ]}
                onPress={() => handleCropSelect(crop.id)}
              >
                <Text style={styles.cropIcon}>{crop.icon}</Text>
                <Text style={[
                  styles.cropLabel,
                  selectedCropId === crop.id && styles.cropLabelActive,
                ]}>
                  {crop.label}
                </Text>
                {selectedCropId === crop.id && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setCropModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Threshold Viewer Modal ─── */}
      <Modal visible={thresholdModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sensor Thresholds</Text>
            <Text style={styles.modalSubtitle}>Safe ranges for {currentCrop.label}</Text>
            {Object.entries(thresholds).map(([key, th]) => (
              <View key={key} style={styles.thresholdRow}>
                <Text style={styles.thresholdName}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </Text>
                <Text style={styles.thresholdRange}>
                  {th.min} – {th.max} {th.unit}
                </Text>
              </View>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setThresholdModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.xxl },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.7)', marginTop: SPACING.xs },
  content: { flex: 1 },
  contentInner: { padding: SPACING.lg, paddingBottom: 40 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOWS.md,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.surfaceDark,
    justifyContent: 'center', alignItems: 'center',
  },
  userInfo: { marginLeft: SPACING.lg, flex: 1 },
  userName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  userEmail: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1,
    marginTop: SPACING.xl, marginBottom: SPACING.sm, marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  menuIcon: {
    width: 42, height: 42, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center',
  },
  menuContent: { flex: 1, marginLeft: SPACING.md },
  menuLabel: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textPrimary },
  menuSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FDEDEC', borderRadius: BORDER_RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.xl, gap: SPACING.sm,
  },
  logoutText: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.danger },
  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  cropOption: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm, backgroundColor: '#F5F5F5',
  },
  cropOptionActive: { backgroundColor: COLORS.primary + '10', borderWidth: 1.5, borderColor: COLORS.primary },
  cropIcon: { fontSize: 24, marginRight: SPACING.md },
  cropLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  cropLabelActive: { color: COLORS.primary, fontWeight: '800' },
  modalClose: { alignItems: 'center', paddingVertical: SPACING.lg, marginTop: SPACING.sm },
  modalCloseText: { fontSize: 16, color: COLORS.textMuted, fontWeight: '600' },
  thresholdRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  thresholdName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  thresholdRange: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});

export default SettingsScreen;
