import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import { useGymStore } from '@/store/gymStore';
import { useSettingsStore } from '@/store/settingsStore';

// ─── Tab bar background ───────────────────────────────────────────────────

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView tint='dark' intensity={40} style={styles.tabBarBlur} />
      <View style={styles.tabBarTint} />
    </View>
  );
}

// ─── Tab icon ─────────────────────────────────────────────────────

interface TabIconProps {
  iconName: IconName;
  color: string;
  focused: boolean;
}

function TabIcon({ iconName, color, focused }: TabIconProps) {
  const focusAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: focused ? 1 : 0,
      damping: 14,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, [focusAnim, focused]);

  const scale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <Animated.View style={[styles.tabIconWrap, { transform: [{ scale }] }]}>
      {focused && (
        <View style={[styles.activeTabBg, { backgroundColor: colors.secondaryContainer + '18' }]} />
      )}
      <Icon
        name={iconName}
        size={focused ? 24 : 22}
        color={focused ? colors.secondaryContainer : colors.onSurfaceVariant + '99'}
      />
    </Animated.View>
  );
}

// ─── Power Orb (FAB) ──────────────────────────────────────────────────────
// Exact spec: 64px, Electric Blue (#00f0ff) → Neon Green (#2ae500) gradient
// with 25px blue glow shadow

function PowerOrbButton() {
  const isOpen = useSettingsStore((s) => s.superAppOpen);
  const open = useSettingsStore((s) => s.openSuperApp);
  const close = useSettingsStore((s) => s.closeSuperApp);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();
    if (isOpen) close();
    else open();
  };

  return (
    <Pressable style={styles.orbContainer} onPress={handlePress}>
      {/* Glow ring — 25px spread Electric Blue per spec */}
      <View style={[styles.orbGlow, isOpen && styles.orbGlowActive]} />
      <Animated.View
        style={[
          styles.orbButton,
          {
            shadowColor: colors.primaryContainer,
            shadowOpacity: isOpen ? 0.3 : 0.5,
          },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Power Orb gradient: Electric Blue → Neon Green */}
        <LinearGradient
          colors={gradients.powerOrb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Icon
          name={isOpen ? 'close' : 'apps'}
          size={26}
          color={colors.white}
        />
      </Animated.View>
    </Pressable>
  );
}

// ─── Tab bar definition ────────────────────────────────────────────────────

export default function TabsLayout() {
  const isWorkoutActive = useGymStore((s) => s.isWorkoutActive);

  const sharedTabOptions = {
    headerShown: false,
    animation: 'shift' as const,
    tabBarActiveTintColor: colors.secondaryContainer,
    tabBarInactiveTintColor: colors.onSurfaceVariant + '99',
    tabBarBackground: () => <TabBarBackground />,
    tabBarStyle: {
      position: 'absolute' as const,
      height: 78,
      marginHorizontal: 0,
      marginBottom: 0,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.08)',
      paddingTop: 8,
      paddingBottom: 24,
      paddingHorizontal: 16,
      backgroundColor: 'transparent',
      overflow: 'visible' as const,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 12,
    } as ViewStyle,
    tabBarItemStyle: { gap: 2, paddingTop: 2 },
    tabBarLabelStyle: {
      fontFamily: fonts.display,
      fontSize: 11,
      letterSpacing: 0.3,
    },
  };

  return (
    <Tabs screenOptions={sharedTabOptions}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon iconName='home' color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name='tasks'
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              iconName='checkbox-marked-outline'
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='magic'
        options={{
          tabBarButton: () => <PowerOrbButton />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name='health'
        options={{
          title: 'Health',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon iconName='heart-pulse' color={color} focused={focused} />
          ),
          ...(isWorkoutActive
            ? { tabBarStyle: { display: 'none' as const } }
            : {}),
        }}
      />
      <Tabs.Screen
        name='finance'
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon iconName='wallet' color={color} focused={focused} />
          ),
        }}
      />

      {/* Hidden routes */}
      <Tabs.Screen name='more' options={{ href: null }} />
      <Tabs.Screen name='inbox' options={{ href: null }} />
      <Tabs.Screen name='journal' options={{ href: null }} />
      <Tabs.Screen name='habits' options={{ href: null }} />
      <Tabs.Screen name='notes' options={{ href: null }} />
      <Tabs.Screen name='goals' options={{ href: null }} />
    </Tabs>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
    overflow: 'hidden',
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,14,14,0.9)', // surface-container-lowest/90
  },

  tabIconWrap: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBg: {
    position: 'absolute',
    width: 44,
    height: 28,
    borderRadius: 12, // rounded-xl
  },

  // Power Orb — exact spec: 64px, Electric Blue → Neon Green, 25px glow
  orbContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  orbGlow: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryContainer,
    opacity: 0.15,
  },
  orbGlowActive: {
    opacity: 0.3,
    backgroundColor: colors.purple,
  },
  orbButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // glow: 0 0 25px rgba(0,240,255,0.5)
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
    elevation: 8,
  },
});
