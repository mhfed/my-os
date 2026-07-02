import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, gradients } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { WidgetCard } from '../WidgetCard';
import { useGymStore } from '@/store/gymStore';
import { useHabitsStore } from '@/store/habitsStore';

export function HealthWidget() {
  const router = useRouter();
  const ready = useGymStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);

  if (!ready) return null;

  const isWorkoutActive = useGymStore((s) => s.isWorkoutActive);
  const history = useGymStore.getState().history;

  const todayStr = new Date().toDateString();
  const todayWorkouts = history.filter((w) => {
    const d = new Date(w.startTime).toDateString();
    return d === todayStr;
  });
  const totalExercisesToday = todayWorkouts.reduce(
    (sum, w) => sum + w.exercises.length, 0
  );

  // Habits data for health context
  const habitViews = habitsReady ? useHabitsStore.getState().views() : [];
  const doneHabits = habitsReady ? useHabitsStore.getState().doneTodayCount() : 0;

  // Weekly streak from workouts
  const weekAgo = Date.now() - 7 * 86400000;
  const workoutDays = new Set(
    history
      .filter((w) => w.startTime > weekAgo)
      .map((w) => new Date(w.startTime).toDateString())
  ).size;

  return (
    <WidgetCard
      domain='health'
      title='Sức khỏe'
      icon='heart-pulse'
      onPress={() => router.push('/health')}
    >
      {/* Status indicator */}
      <View style={styles.statusRow}>
        {isWorkoutActive ? (
          <View style={[styles.statusBadge, styles.activeBadge]}>
            <Icon name='dumbbell' size={14} color={colors.white} />
            <Text style={styles.activeText}>Đang tập</Text>
          </View>
        ) : todayWorkouts.length > 0 ? (
          <View style={[styles.statusBadge, styles.doneBadge]}>
            <Icon name='check-bold' size={14} color={colors.white} />
            <Text style={styles.doneText}>Đã tập hôm nay</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.restBadge]}>
            <Icon name='bed' size={14} color={colors.muted} />
            <Text style={styles.restText}>Ngày nghỉ</Text>
          </View>
        )}
      </View>

      {/* Stats grid */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{totalExercisesToday}</Text>
          <Text style={styles.metricLabel}>Bài tập</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{workoutDays}</Text>
          <Text style={styles.metricLabel}>Ngày/tuần</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{doneHabits}</Text>
          <Text style={styles.metricLabel}>Thói quen</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{history.length}</Text>
          <Text style={styles.metricLabel}>Tổng buổi</Text>
        </View>
      </View>

      {/* Weekly mini bar chart */}
      {history.length > 0 && (
        <View style={styles.weekRow}>
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayStr = date.toDateString();
            const hasWorkout = history.some(
              (w) => new Date(w.startTime).toDateString() === dayStr
            );
            return (
              <View key={day} style={styles.weekBarCol}>
                <View
                  style={[
                    styles.weekBar,
                    {
                      height: hasWorkout ? 24 : 8,
                      backgroundColor: hasWorkout ? colors.red : colors.track,
                    },
                  ]}
                />
                <Text style={[
                  styles.weekLabel,
                  { color: hasWorkout ? colors.red : colors.muted }
                ]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  activeBadge: {
    backgroundColor: colors.green,
  },
  doneBadge: {
    backgroundColor: colors.blue,
  },
  restBadge: {
    backgroundColor: colors.track,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeText: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.white,
  },
  doneText: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.white,
  },
  restText: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.muted,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: 8,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {
    fontFamily: fonts.displayExtra,
    fontSize: 16,
    color: colors.red,
  },
  metricLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border + '60',
  },
  weekBarCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  weekBar: {
    width: 8,
    borderRadius: 4,
  },
  weekLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
  },
});
