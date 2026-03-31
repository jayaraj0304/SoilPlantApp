// ─── Sensor Detail Screen — Historical Graph View ────────────────────────────
// Shows time-series chart of a specific sensor's readings

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { subscribeSensorHistory } from '../services/api';

const { width } = Dimensions.get('window');

const SensorDetailScreen = ({ route, navigation }) => {
  const { sensorKey, title, color, unit, icon, currentValue } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeSensorHistory((data) => {
      setHistory(data || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Prepare chart data — take last 12 readings
  const recentHistory = history.slice(-12);
  const labels = recentHistory.map((item, idx) => {
    if (!item.timestamp) return '';
    const d = new Date(item.timestamp);
    const h = d.getHours();
    const m = d.getMinutes();
    // Show every 2nd label to avoid crowding
    if (idx % 2 !== 0) return '';
    return `${h}:${m < 10 ? '0' + m : m}`;
  });
  const values = recentHistory.map((item) => item[sensorKey] || 0);

  // Statistics
  const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const trend = values.length >= 2 ? values[values.length - 1] - values[values.length - 2] : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={[color, shadeColor(color, -30)]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name={icon} size={40} color="rgba(255,255,255,0.9)" />
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.currentValueRow}>
            <Text style={styles.currentValue}>{currentValue}</Text>
            <Text style={styles.currentUnit}>{unit}</Text>
          </View>
          <View style={styles.trendRow}>
            <Ionicons
              name={trend >= 0 ? 'trending-up' : 'trending-down'}
              size={18}
              color={trend >= 0 ? '#A5D6A7' : '#EF9A9A'}
            />
            <Text style={[styles.trendText, { color: trend >= 0 ? '#A5D6A7' : '#EF9A9A' }]}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)} {unit} from last reading
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={[styles.statValue, { color }]}>{avg.toFixed(1)}</Text>
            <Text style={styles.statUnit}>{unit}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Max</Text>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>{maxVal.toFixed(1)}</Text>
            <Text style={styles.statUnit}>{unit}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Min</Text>
            <Text style={[styles.statValue, { color: COLORS.info }]}>{minVal.toFixed(1)}</Text>
            <Text style={styles.statUnit}>{unit}</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>📈 Reading History</Text>
          {loading ? (
            <ActivityIndicator size="large" color={color} style={{ marginVertical: 40 }} />
          ) : values.length > 1 ? (
            <LineChart
              data={{
                labels: labels,
                datasets: [{ data: values, color: () => color, strokeWidth: 3 }],
              }}
              width={width - 48}
              height={220}
              yAxisSuffix={unit.length <= 3 ? unit : ''}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalCount: 1,
                color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
                labelColor: () => COLORS.textSecondary,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: color,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '5,5',
                  stroke: '#E0E0E0',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.noData}>
              <Ionicons name="hourglass-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.noDataText}>
                Waiting for more readings...{'\n'}Data will appear as the ESP32 sends updates.
              </Text>
            </View>
          )}
        </View>

        {/* All Readings Table */}
        {recentHistory.length > 0 && (
          <View style={styles.tableContainer}>
            <Text style={styles.sectionTitle}>📋 Recent Readings</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Time</Text>
              <Text style={styles.tableHeaderText}>Value</Text>
            </View>
            {[...recentHistory].reverse().map((item, idx) => {
              const d = new Date(item.timestamp);
              return (
                <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    {'  '}
                    <Text style={styles.tableDateSmall}>
                      {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </Text>
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold]}>
                    {(item[sensorKey] || 0).toFixed(1)} {unit}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Utility to darken a hex color
function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: SPACING.sm },
  currentValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.sm },
  currentValue: { fontSize: 48, fontWeight: '900', color: '#FFF' },
  currentUnit: { fontSize: 20, color: 'rgba(255,255,255,0.8)', marginLeft: 4 },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: { fontSize: 12, fontWeight: '600' },
  body: { padding: SPACING.lg, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: 4,
    ...SHADOWS.sm,
  },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  statUnit: { fontSize: 10, color: COLORS.textMuted },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
    marginBottom: SPACING.xl,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  chart: { borderRadius: BORDER_RADIUS.md, marginLeft: -16 },
  noData: { alignItems: 'center', paddingVertical: 40 },
  noDataText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  tableContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  tableHeaderText: { flex: 1, fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 10 },
  tableRowAlt: { backgroundColor: '#F9FBE7' },
  tableCell: { flex: 1, fontSize: 13, color: COLORS.textPrimary },
  tableCellBold: { fontWeight: '700' },
  tableDateSmall: { fontSize: 10, color: COLORS.textMuted },
});

export default SensorDetailScreen;
