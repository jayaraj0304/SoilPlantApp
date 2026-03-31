// ─── Theme Configuration ─────────────────────────────────────────────────────
// Central design system for the Soil-Plant Physiological Coupling App
// ─────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  // Primary palette — earthy greens
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  primaryDark: '#0D3B13',
  primaryGradientStart: '#2E7D32',
  primaryGradientEnd: '#1B5E20',

  // Accent — warm amber
  accent: '#FF8F00',
  accentLight: '#FFB300',

  // Background
  background: '#F1F8E9',
  surface: '#FFFFFF',
  surfaceDark: '#E8F5E9',
  card: '#FFFFFF',

  // Text
  textPrimary: '#1B2631',
  textSecondary: '#566573',
  textLight: '#FFFFFF',
  textMuted: '#95A5A6',

  // Status colors
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',

  // Risk level colors
  riskLow: '#27AE60',
  riskMedium: '#F39C12',
  riskHigh: '#E74C3C',

  // Farm health score gradient
  healthExcellent: '#2ECC71',
  healthGood: '#82E0AA',
  healthFair: '#F4D03F',
  healthPoor: '#E67E22',
  healthCritical: '#E74C3C',

  // Misc
  border: '#E0E0E0',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 48,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Sensor thresholds — default (can be overridden per crop)
export const DEFAULT_THRESHOLDS = {
  temperature: { min: 15, max: 40, unit: '°C' },
  humidity: { min: 30, max: 90, unit: '%' },
  soilMoisture: { min: 20, max: 80, unit: '%' },
  soilPH: { min: 5.5, max: 8.0, unit: 'pH' },
  chlorophyll: { min: 20, max: 80, unit: 'SPAD' },
  turbidity: { min: 0, max: 100, unit: 'NTU' },
};

// Crop-specific threshold overrides
export const CROP_THRESHOLDS = {
  rice: {
    temperature: { min: 20, max: 35, unit: '°C' },
    humidity: { min: 60, max: 90, unit: '%' },
    soilMoisture: { min: 50, max: 90, unit: '%' },
    soilPH: { min: 5.5, max: 7.0, unit: 'pH' },
    chlorophyll: { min: 30, max: 70, unit: 'SPAD' },
    turbidity: { min: 0, max: 80, unit: 'NTU' },
  },
  wheat: {
    temperature: { min: 15, max: 30, unit: '°C' },
    humidity: { min: 40, max: 70, unit: '%' },
    soilMoisture: { min: 30, max: 65, unit: '%' },
    soilPH: { min: 6.0, max: 7.5, unit: 'pH' },
    chlorophyll: { min: 35, max: 75, unit: 'SPAD' },
    turbidity: { min: 0, max: 60, unit: 'NTU' },
  },
  maize: {
    temperature: { min: 18, max: 33, unit: '°C' },
    humidity: { min: 50, max: 80, unit: '%' },
    soilMoisture: { min: 40, max: 75, unit: '%' },
    soilPH: { min: 5.8, max: 7.0, unit: 'pH' },
    chlorophyll: { min: 30, max: 65, unit: 'SPAD' },
    turbidity: { min: 0, max: 70, unit: 'NTU' },
  },
  cotton: {
    temperature: { min: 20, max: 37, unit: '°C' },
    humidity: { min: 40, max: 65, unit: '%' },
    soilMoisture: { min: 35, max: 60, unit: '%' },
    soilPH: { min: 6.0, max: 8.0, unit: 'pH' },
    chlorophyll: { min: 25, max: 60, unit: 'SPAD' },
    turbidity: { min: 0, max: 65, unit: 'NTU' },
  },
  sugarcane: {
    temperature: { min: 20, max: 38, unit: '°C' },
    humidity: { min: 55, max: 85, unit: '%' },
    soilMoisture: { min: 50, max: 80, unit: '%' },
    soilPH: { min: 5.5, max: 7.5, unit: 'pH' },
    chlorophyll: { min: 30, max: 70, unit: 'SPAD' },
    turbidity: { min: 0, max: 75, unit: 'NTU' },
  },
};

export const CROPS = [
  { id: 'rice', label: 'Rice 🌾', icon: '🌾' },
  { id: 'wheat', label: 'Wheat 🌿', icon: '🌿' },
  { id: 'maize', label: 'Maize 🌽', icon: '🌽' },
  { id: 'cotton', label: 'Cotton ☁️', icon: '☁️' },
  { id: 'sugarcane', label: 'Sugarcane 🎋', icon: '🎋' },
];
