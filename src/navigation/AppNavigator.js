// ─── App Navigation ──────────────────────────────────────────────────────────
// Bottom tab navigator with Dashboard, Microplastic, Alerts, Settings

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import AlertsScreen from '../screens/AlertsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SensorDetailScreen from '../screens/SensorDetailScreen';
import MicroplasticScreen from '../screens/MicroplasticScreen';
import { COLORS, FONTS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dashboard Stack (Dashboard + SensorDetail)
const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="SensorDetail" component={SensorDetailScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = ({ onLogout, user }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else if (route.name === 'Microplastic') {
              iconName = focused ? 'flask' : 'flask-outline';
            } else if (route.name === 'Alerts') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return (
              <View style={focused ? styles.activeTab : null}>
                <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />
              </View>
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStack} />
        <Tab.Screen name="Microplastic" component={MicroplasticScreen} options={{ tabBarLabel: 'Insight' }} />
        <Tab.Screen name="Alerts" component={AlertsScreen} />
        <Tab.Screen
          name="Settings"
          children={() => <SettingsScreen onLogout={onLogout} user={user} />}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 4,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '12',
    borderRadius: 12,
    padding: 6,
  },
});

export default AppNavigator;
