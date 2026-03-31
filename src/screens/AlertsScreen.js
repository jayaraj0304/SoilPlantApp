// ─── Alerts Screen — Real-Time Alert Feed ────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { subscribeAlerts, clearAlerts } from '../services/api';
import { formatTimestamp } from '../utils/helpers';

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, danger, warning, info
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = subscribeAlerts((data) => {
      setAlerts(data || []);
    });
    return () => unsub();
  }, []);

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter((a) => a.type === filter);

  const dangerCount = alerts.filter((a) => a.type === 'danger').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;
  const infoCount = alerts.filter((a) => a.type === 'info').length;

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger': return { icon: 'alert-circle', color: COLORS.danger, bg: '#FDEDEC' };
      case 'warning': return { icon: 'warning', color: COLORS.warning, bg: '#FEF5E7' };
      default: return { icon: 'information-circle', color: COLORS.info, bg: '#EBF5FB' };
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleClearAll = () => {
    if (alerts.length === 0) return;

    Alert.alert(
      'Clear All Alerts',
      'Are you sure you want to remove all current alerts? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAlerts();
              // The database listener will automatically update the UI
            } catch (error) {
              Alert.alert('Error', 'Failed to clear alerts. Please try again.');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🔔 Alerts</Text>
            <Text style={styles.headerSubtitle}>Real-time sensor notifications</Text>
          </View>
          {alerts.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
              <Ionicons name="trash-bin-outline" size={20} color="#FFF" />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Summary Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(231,76,60,0.2)' }]}>
            <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
            <Text style={[styles.badgeText, { color: COLORS.danger }]}>{dangerCount} Critical</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(243,156,18,0.2)' }]}>
            <Ionicons name="warning" size={14} color={COLORS.warning} />
            <Text style={[styles.badgeText, { color: COLORS.warning }]}>{warningCount} Warning</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(52,152,219,0.2)' }]}>
            <Ionicons name="information-circle" size={14} color={COLORS.info} />
            <Text style={[styles.badgeText, { color: COLORS.info }]}>{infoCount} Info</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'danger', label: 'Critical' },
          { key: 'warning', label: 'Warnings' },
          { key: 'info', label: 'Info' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.filterText, filter === tab.key && styles.filterTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alerts List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.success} />
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No Alerts' : `No ${filter} alerts`}
            </Text>
            <Text style={styles.emptyText}>
              All sensor readings are within safe thresholds. Your farm is healthy! 🌾
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const theme = getAlertIcon(alert.type);
            return (
              <View key={alert.id || idx} style={[styles.alertCard, { borderLeftColor: theme.color }]}>
                <View style={[styles.alertIconBox, { backgroundColor: theme.bg }]}>
                  <Ionicons name={theme.icon} size={24} color={theme.color} />
                </View>
                <View style={styles.alertContent}>
                  <View style={styles.alertTopRow}>
                    <Text style={[styles.alertTitle, { color: theme.color }]} numberOfLines={1}>
                      {alert.title}
                    </Text>
                    <View style={[styles.typeBadge, { backgroundColor: theme.color + '20' }]}>
                      <Text style={[styles.typeText, { color: theme.color }]}>
                        {alert.type === 'danger' ? 'CRITICAL' : alert.type?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.alertMessage} numberOfLines={2}>{alert.message}</Text>
                  <View style={styles.alertMeta}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.alertTime}>{formatTimestamp(alert.timestamp)}</Text>
                    {alert.value && (
                      <>
                        <Text style={styles.alertDot}>•</Text>
                        <Text style={styles.alertSensor}>
                          {alert.sensor}: {typeof alert.value === 'number' ? alert.value.toFixed(1) : alert.value}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  clearText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  badgeRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: '#FFF' },
  listContent: { padding: SPACING.lg, paddingBottom: 40 },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  alertIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  alertContent: { flex: 1 },
  alertTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  typeText: { fontSize: 9, fontWeight: '800' },
  alertMessage: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 17 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  alertTime: { fontSize: 10, color: COLORS.textMuted },
  alertDot: { fontSize: 10, color: COLORS.textMuted },
  alertSensor: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.lg },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22, paddingHorizontal: 20 },
});

export default AlertsScreen;
