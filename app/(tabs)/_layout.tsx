import { useRef } from 'react';
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

import {
  base3D,
  colors,
  glass,
  glassy,
  gradients,
  glow,
  radius,
} from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Ucon } from '@/theme/icons';
import { useGymStore } from '@/store/gymStore';
import { useSettingsStore } from '@/store/settingsStore';

// ─── Tab bar background ───────────────────────────────────────────────────

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView tint='light' intensity={42} style={styles.tabBarBlur} />
      <View style={styles.tabBarTint} />
      <LinearGradient
        colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.tabBarGloss}
        pointerEvents='none'
      />
    </View>
  );
}

// ─── 3D Game tab icon ─────────────────────────────────────────────────────

interface GameTabIconProps {
  iconName: 'home' | 'clipboard-notes' | 'heartbeat' | 'wallet';
  color: string;
  focused: boolean;
}

function GameTabIcon({ iconName, color, focused }: GameTabIconProps) {
  return (
    <View style={styles.tabIconWrap}>
      {/* 3D base shadow when active */}
      {focused && (
        <View style={[styles.tabIconGlow, { backgroundColor: color + '30' }]} />
      )}
      {/* Glass background when active */}
      {focused && (
        <LinearGradient
          colors={[color + '20', color + '08']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={styles.tabIconBg}
        />
      )}
      <Ucon
        name={iconName}
        size={focused ? 24 : 22}
        color={focused ? color : colors.tabInactive}
      />
    </View>
  );
}

// ─── Magic center button ──────────────────────────────────────────────────

function MagicTabButton() {
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
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  return (
    <Pressable style={styles.magicContainer} onPress={handlePress}>
      {/* Outer glow ring - pulses when active */}
      <View style={[styles.magicGlow, isOpen && styles.magicGlowActive]} />
      {/* 3D jelly button */}
      <Animated.View
        style={[
          styles.magicButton,
          isOpen && styles.magicButtonActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={
            isOpen
              ? [glassy(colors.purpleDeep, 'E8'), glassy(colors.purple, 'E0')]
              : [
                  glassy(gradients.purple[0], 'D6'),
                  glassy(gradients.purple[1], 'E8'),
                ]
          }
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={gradients.gloss}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.7 }}
          style={styles.magicGloss}
          pointerEvents='none'
        />
        <Ucon name={isOpen ? 'times' : 'apps'} size={24} color='#fff' />
      </Animated.View>
    </Pressable>
  );
}

// ─── Tab bar definition ────────────────────────────────────────────────────

export default function TabsLayout() {
  const isWorkoutActive = useGymStore((s) => s.isWorkoutActive);

  const sharedTabOptions = {
    headerShown: false,
    tabBarActiveTintColor: colors.purple,
    tabBarInactiveTintColor: colors.tabInactive,
    tabBarBackground: () => <TabBarBackground />,
    tabBarStyle: {
      position: 'absolute' as const,
      height: 82,
      marginHorizontal: 12,
      marginBottom: 12,
      borderRadius: 28,
      paddingTop: 10,
      paddingBottom: 22,
      borderTopWidth: 0,
      backgroundColor: 'transparent',
      overflow: 'visible' as const,
      // 3D game shadow — hard coloured base + soft premium glow
      shadowColor: '#5C3A0E',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 12,
    } as ViewStyle,
    tabBarItemStyle: { gap: 3, paddingTop: 2 },
    tabBarLabelStyle: {
      fontFamily: fonts.displayBold,
      fontSize: 10,
      letterSpacing: 0.2,
    },
  };

  return (
    <Tabs screenOptions={sharedTabOptions}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <GameTabIcon iconName='home' color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name='tasks'
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <GameTabIcon
              iconName='clipboard-notes'
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='magic'
        options={{
          tabBarButton: () => <MagicTabButton />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name='health'
        options={{
          title: 'Health',
          tabBarIcon: ({ color, focused }) => (
            <GameTabIcon iconName='heartbeat' color={color} focused={focused} />
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
            <GameTabIcon iconName='wallet' color={color} focused={focused} />
          ),
        }}
      />

      {/* Hidden routes — accessible via Super App or other flows */}
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
  // Tab bar surfaces — a floating pane of frosted glass over the farm scene
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    overflow: 'hidden',
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245,235,220,0.42)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: glass.rim,
  },
  tabBarGloss: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },

  // Tab icon
  tabIconWrap: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconGlow: {
    position: 'absolute',
    width: 36,
    height: 28,
    borderRadius: 14,
  },
  tabIconBg: {
    position: 'absolute',
    width: 36,
    height: 28,
    borderRadius: 14,
  },

  // Magic center button — 3D glossy purple jelly slab
  magicContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  magicGlow: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.gold,
    opacity: 0.18,
  },
  magicGlowActive: {
    opacity: 0.35,
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  magicButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...base3D(colors.purpleDeep, 5),
    marginBottom: 4,
    overflow: 'hidden',
  },
  magicButtonActive: {
    ...base3D('#3B2FAF', 4),
  },
  magicGloss: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
    height: '56%',
    borderRadius: 27,
  },
});
