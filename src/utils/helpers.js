// ─── Utility Helpers ─────────────────────────────────────────────────────────

/**
 * Get risk level info from yield loss percentage
 */
export const getRiskLevel = (yieldLoss) => {
  if (yieldLoss <= 10) {
    return { level: 'Low', color: '#27AE60', emoji: '✅', bgColor: '#E8F8F0' };
  } else if (yieldLoss <= 30) {
    return { level: 'Medium', color: '#F39C12', emoji: '⚠️', bgColor: '#FEF5E7' };
  } else {
    return { level: 'High', color: '#E74C3C', emoji: '🚨', bgColor: '#FDEDEC' };
  }
};

/**
 * Get contamination level from turbidity
 */
export const getContaminationLevel = (turbidity) => {
  if (turbidity <= 30) {
    return { level: 'Low', color: '#27AE60', description: 'Water quality is within safe limits.' };
  } else if (turbidity <= 60) {
    return { level: 'Medium', color: '#F39C12', description: 'Moderate contamination detected. Monitor closely.' };
  } else {
    return { level: 'High', color: '#E74C3C', description: 'High contamination! Immediate action recommended.' };
  }
};

/**
 * Get farm health score color
 */
export const getHealthColor = (score) => {
  if (score >= 80) return '#2ECC71';
  if (score >= 60) return '#82E0AA';
  if (score >= 40) return '#F4D03F';
  if (score >= 20) return '#E67E22';
  return '#E74C3C';
};

/**
 * Get farm health label
 */
export const getHealthLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Critical';
};

/**
 * Format timestamp
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Check if sensor value exceeds threshold
 */
export const checkThreshold = (value, threshold) => {
  if (!threshold) return { exceeded: false };
  if (value < threshold.min) {
    return { exceeded: true, type: 'low', message: `Below minimum (${threshold.min}${threshold.unit})` };
  }
  if (value > threshold.max) {
    return { exceeded: true, type: 'high', message: `Above maximum (${threshold.max}${threshold.unit})` };
  }
  return { exceeded: false };
};
