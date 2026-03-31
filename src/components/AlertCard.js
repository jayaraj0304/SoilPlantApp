import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const AlertCard = ({ title, message, type, timestamp, onClose }) => {
  const getColors = () => {
    switch (type) {
      case 'danger': return { bg: '#FDEDEC', border: COLORS.danger, icon: 'alert-circle' };
      case 'warning': return { bg: '#FEF5E7', border: COLORS.warning, icon: 'warning' };
      default: return { bg: '#EBF5FB', border: COLORS.info, icon: 'information-circle' };
    }
  };

  const theme = getColors();

  return (
    <View style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={theme.icon} size={24} color={theme.border} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.border }]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <Ionicons name="close" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 5,
    marginVertical: SPACING.sm,
    ...SHADOWS.sm,
    position: 'relative',
  },
  iconContainer: {
    marginRight: SPACING.md,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default AlertCard;
