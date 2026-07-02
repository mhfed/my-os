import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, gradients } from '@/theme/colors';
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

  // Streaks
  let maxStreak = 0;
  let totalStreak = 0;
  for (const h of habitViews) {
    if (h.streak > maxStreak) maxStreak = h.streak;
    totalStreak += h.streak;
  }
  const avgStreak = total > 0 ? Math.round(totalStreak / total) : 0;

  return (
    <WidgetCard
      domain='habits'
      title='Thói quen'
      icon='checkbox-marked-circle-outline'
      onPress={() => router.push('/habits')}
    >
      {/* Header stats */}
      <View style={styles.headerRow}>
        <Text style={styles.count}>{doneTodayCount}/{total}</Text>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={gradients.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.round(ratio * 100)}%` }]}
          />
        </View>
      </View>

      {/* Habit pills */}
      {habitViews.length > 0 ? (
        <View style={styles.pillRow}>
          {habitViews.slice(0, 4).map((habit) => (
            <HabitPill
              key={habit.id}
              habit={habit}
              onToggle={toggleToday}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Chưa có thói quen</Text>
      )}

      {/* Streak row */}
      {maxStreak > 0 && (
        <View style={styles.streakRow}>
          <StreakIndicator count={maxStreak} />
          {avgStreak > 1 && (
            <Text style={styles.avgStreak}>
              TB {avgStreak} ngày
            </Text>
          )}
        </View>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 20,
    color: colors.orange,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  empty: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  avgStreak: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
});
