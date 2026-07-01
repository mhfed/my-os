import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { WidgetCard } from '../WidgetCard';
import { useHabitsStore } from '@/store/habitsStore';
import { StreakIndicator } from '../StreakIndicator';
import { HabitPill } from '../HabitPill';

export function HabitsWidget() {
  const router = useRouter();
  const habitsReady = useHabitsStore((s) => s.ready);
  const toggleToday = useHabitsStore((s) => s.toggleToday);

  if (!habitsReady) return null;

  const habitViews = useHabitsStore.getState().views();
  const doneTodayCount = useHabitsStore.getState().doneTodayCount();
  const total = habitViews.length;
  const ratio = total > 0 ? doneTodayCount / total : 0;

  // Compute max streak across all habits
  let maxStreak = 0;
  for (const h of habitViews) {
    if (h.streak > maxStreak) maxStreak = h.streak;
  }

  return (
    <WidgetCard
      domain='habits'
      title='Habits'
      icon='checkbox-marked-circle-outline'
      onPress={() => router.push('/habits')}
    >
      <View style={styles.headerRow}>
        <Text style={styles.count}>
          {doneTodayCount}/{total}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(ratio * 100)}%` },
            ]}
          />
        </View>
      </View>
      <View style={styles.pillRow}>
        {habitViews.slice(0, 4).map((habit) => (
          <HabitPill
            key={habit.id}
            habit={habit}
            onToggle={toggleToday}
          />
        ))}
      </View>
      {maxStreak > 0 && (
        <StreakIndicator count={maxStreak} />
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 18,
    color: colors.orange,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.orange,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
