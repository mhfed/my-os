import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';

import { base3D, colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useGymStore } from '@/store/gymStore';
import { useSettingsStore } from '@/store/settingsStore';

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView tint='light' intensity={40} style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarTint} />
    </View>
  );
}

function MagicTabButton() {
  const isOpen = useSettingsStore((s) => s.superAppOpen);
  const open = useSettingsStore((s) => s.openSuperApp);
  const close = useSettingsStore((s) => s.closeSuperApp);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 10,
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
      {/* Outer glow ring */}
      <View style={[styles.magicGlow, isOpen && styles.magicGlowActive]} />
      <Animated.View
        style={[
          styles.magicButton,
          isOpen && styles.magicButtonActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Icon
          name={isOpen ? 'close' : 'view-grid-plus'}
          size={24}
          color='#fff'
        />
      </Animated.View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const isWorkoutActive = useGymStore((s) => s.isWorkoutActive);

  const sharedTabOptions = {
    headerShown: false,
    tabBarActiveTintColor: colors.purple,
    tabBarInactiveTintColor: colors.tabInactive,
    tabBarBackground: () => <TabBarBackground />,
    tabBarStyle: {
      position: 'absolute' as const,
      height: 88,
      paddingTop: 12,
      paddingBottom: 26,
      borderTopWidth: 2,
      borderTopColor: colors.white,
      backgroundColor: 'transparent',
    },
    tabBarItemStyle: { gap: 5 },
    tabBarLabelStyle: {
      fontFamily: fonts.displayBold,
      fontSize: 10,
    },
  };

  return (
    <Tabs screenOptions={sharedTabOptions}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => (
            <Icon name='view-grid' size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='tasks'
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <Icon name='checkbox-marked-outline' size={23} color={color} />
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
          tabBarIcon: ({ color }) => (
            <Icon name='heart-pulse' size={23} color={color} />
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
          tabBarIcon: ({ color }) => (
            <Icon name='wallet' size={23} color={color} />
          ),
        }}
      />

      {/* Hidden routes — accessible via Super App or More */}
      <Tabs.Screen name='more' options={{ href: null }} />
      <Tabs.Screen name='inbox' options={{ href: null }} />
      <Tabs.Screen name='journal' options={{ href: null }} />
      <Tabs.Screen name='habits' options={{ href: null }} />
      <Tabs.Screen name='notes' options={{ href: null }} />
      <Tabs.Screen name='goals' options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244,248,255,0.88)',
  },

  /* Magic float button — 3D glossy purple slab */
  magicContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
  },
  magicGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purple,
    opacity: 0.22,
  },
  magicGlowActive: {
    opacity: 0.36,
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  magicButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...base3D(colors.purpleDeep, 5),
    marginBottom: 4,
  },
  magicButtonActive: {
    backgroundColor: colors.purpleDeep,
  },
});
