import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useHabitsStore } from '@/store/habitsStore';

import { HabitCard } from './components/HabitCard';
import { WeeklyGrid } from './components/WeeklyGrid';

/**
 * Habits tracker screen.
 *
 * NOTE: The source design renders the completion % as a purple→teal gradient
 * text. RN gradient text requires @react-native-masked-view, which is not
 * installed, so a solid purple is used instead.
 */
export function HabitsScreen() {
  const ready = useHabitsStore((s) => s.ready);
  const init = useHabitsStore((s) => s.init);
  const views = useHabitsStore((s) => s.views);
  const completion = useHabitsStore((s) => s.completion);
  const toggleLog = useHabitsStore((s) => s.toggleLog);
  // Subscribe to the raw rows so derived selectors re-run on every change.
  useHabitsStore((s) => s.habits);
  useHabitsStore((s) => s.logs);

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]} edges={['top']}>
        <ActivityIndicator color={colors.purple} />
      </SafeAreaView>
    );
  }

  const habitViews = views();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Habits</Text>
            <Text style={styles.subtitle}>June 2025</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.completionValue}>{completion()}%</Text>
            <Text style={styles.completionLabel}>completion</Text>
          </View>
        </View>

        <WeeklyGrid views={habitViews} onToggleLog={toggleLog} />

        <View style={styles.list}>
          {habitViews.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  headerLeft: {},
  title: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  completionValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 30,
    lineHeight: 30,
    color: colors.purple,
  },
  completionLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  list: {
    gap: 12,
  },
});
