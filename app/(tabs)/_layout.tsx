import { Tabs } from 'expo-router';
import { Home, List, Search, Settings } from 'lucide-react-native';
import { COLORS } from '@/lib/constants';
import { useSettings } from '@/hooks/useSettings';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { settings } = useSettings();

  if (!settings) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!settings.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="thoughts"
        options={{
          title: 'Thoughts',
          tabBarIcon: ({ size, color }) => (
            <List size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
