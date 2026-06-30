import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useGymStore } from '@/store/gymStore';
import { useSettingsStore } from '@/store/settingsStore';

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView tint='dark' intensity={30} style={StyleSheet.absoluteFill} />
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
      borderTopWidth: 1,
      borderTopColor: colors.track,
      backgroundColor: 'transparent',
    },
    tabBarItemStyle: { gap: 5 },
    tabBarLabelStyle: {
      fontFamily: fonts.semibold,
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
    backgroundColor: 'rgba(10,10,15,0.88)',
  },

  /* Magic float button */
  magicContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
  },
  magicGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.purple,
    opacity: 0.18,
  },
  magicGlowActive: {
    opacity: 0.32,
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  magicButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
    marginBottom: 4,
  },
  magicButtonActive: {
    backgroundColor: '#5a4db8',
  },
});
