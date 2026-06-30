import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, TABS } from '@/theme/icons';

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView tint='dark' intensity={30} style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarTint} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          height: 88,
          paddingTop: 12,
          paddingBottom: 26,
          borderTopWidth: 1,
          borderTopColor: colors.track,
          backgroundColor: 'transparent',
        },
        tabBarItemStyle: {
          gap: 5,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 10,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.route}
          name={tab.route}
          options={{
            title: tab.label,
            tabBarIcon: ({ color }) => (
              <Icon name={tab.icon} size={23} color={color} />
            ),
            // The Health tab is the immersive active-workout view — it has its
            // own "Finish workout" bar, so hide the app tab bar while focused.
            ...(tab.route === 'health'
              ? { tabBarStyle: { display: 'none' } }
              : {}),
          }}
        />
      ))}

      {/* Hidden routes — not shown in the bar, reached from the More hub.
          The bar stays visible so the user can navigate away by tapping a tab. */}
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
});
