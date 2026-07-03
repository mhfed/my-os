import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AnimatedCard, PressableScale } from '@/components/motion';
import { GamePanel } from '@/components/game';
import { colors, gradients, radius, base3D } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useGymStore } from '@/store/gymStore';
import { useGoalStore } from '@/store/goalStore';

export const PersonStatsWidget = memo(function PersonStatsWidget() {
  const router = useRouter();
  const tasksReady = useTasksStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const gymReady = useGymStore((s) => s.ready);
  const goalsReady = useGoalStore((s) => s.ready);

  if (!tasksReady || !habitsReady || !gymReady || !goalsReady) return null;

  // Tasks today
  const tasks = useTasksStore.getState().tasks;
  const sectionOf = useTasksStore.getState().sectionOf;
  const todayTasks = tasks.filter((t) => sectionOf(t) === 'today');
  const doneTasks = todayTasks.filter((t) => t.done).length;
  const taskTotal = todayTasks.length;
  const taskPct = taskTotal > 0 ? Math.round((doneTasks / taskTotal) * 100) : 0;

  // Habits today
  const habitViews = useHabitsStore.getState().views();
  const doneHabits = useHabitsStore.getState().doneTodayCount();
  const habitTotal = habitViews.length;
  const habitPct = habitTotal > 0 ? Math.round((doneHabits / habitTotal) * 100) : 0;

  // Gym today
  const history = useGymStore.getState().history;
  const todayStr = new Date().toDateString();
  const todayWorkouts = history.filter((w) => {
    const d = new Date(w.startTime).toDateString();
    return d === todayStr;
  });
  const hasWorkoutToday = todayWorkouts.length > 0;

  // Goals
  const goals = useGoalStore.getState().goals;
  const activeGoals = goals.filter((g) => g.status === 'active');
  const goalProgress = activeGoals.length > 0
    ? Math.round(
        (activeGoals.filter((g) => {
          const done = g.milestones.filter((m) => m.done).length;
          return g.milestones.length > 0 && done === g.milestones.length;
        }).length /
          activeGoals.length) *
          100
      )
    : 0;

  // Best streak from habits
  let maxStreak = 0;
  for (const h of habitViews) {
    if (h.streak > maxStreak) maxStreak = h.streak;
  }

  const stats = [
    {
      icon: 'checkbox-marked-outline' as const,
      label: 'Nhiệm vụ',
      value: `${doneTasks}/${taskTotal}`,
      pct: taskPct,
      color: colors.blue,
      gradient: gradients.blue,
      route: '/tasks' as const,
    },
    {
      icon: 'checkbox-marked-circle-outline' as const,
      label: 'Thói quen',
      value: `${doneHabits}/${habitTotal}`,
      pct: habitPct,
      color: colors.orange,
      gradient: gradients.gold,
      route: '/habits' as const,
    },
    {
      icon: 'heart-pulse' as const,
      label: 'Sức khỏe',
      value: hasWorkoutToday ? 'Đã tập' : 'Nghỉ ngơi',
      pct: hasWorkoutToday ? 100 : 0,
      color: colors.red,
      gradient: gradients.red,
      route: '/health' as const,
    },
    {
      icon: 'trophy-outline' as const,
      label: 'Mục tiêu',
      value: `${activeGoals.length} mục tiêu`,
      pct: goalProgress,
      color: colors.green,
      gradient: gradients.green,
      route: '/goals' as const,
    },
  ];

  return (
    <AnimatedCard index={1} style={styles.wrapper}>
      <PressableScale onPress={() => router.push('/health')} scaleTo={0.98} haptic='light'>
        <GamePanel style={styles.panel} flush>
          {/* Background accent bar */}
          <LinearGradient
            colors={gradients.purple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={gradients.purple}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={styles.iconBadge}
              >
                <Icon name='account' size={20} color={colors.white} />
              </LinearGradient>
              <View>
                <Text style={styles.headerTitle}>Cá nhân</Text>
                <Text style={styles.headerSub}>Sức khỏe & Thói quen</Text>
              </View>
            </View>
            {maxStreak > 0 && (
              <View style={styles.streakBadge}>
                <Icon name='fire' size={14} color={colors.orange} />
                <Text style={styles.streakCount}>{maxStreak}</Text>
              </View>
            )}
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <PressableScale
                key={stat.label}
                onPress={() => router.push(stat.route)}
                scaleTo={0.95}
                haptic='light'
              >
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={[stat.color + '20', stat.color + '08']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statBg}
                  />
                  <View style={[styles.statIconWrap, { backgroundColor: stat.color + '20' }]}>
                    <Icon name={stat.icon} size={16} color={stat.color} />
                  </View>
                  <Text style={[styles.statValue, { color: stat.color }]}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <View style={styles.statTrack}>
                    <View
                      style={[
                        styles.statFill,
                        {
                          width: `${stat.pct}%`,
                          backgroundColor: stat.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </PressableScale>
            ))}
          </View>
        </GamePanel>
      </PressableScale>
    </AnimatedCard>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  panel: {
    paddingTop: 0,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    ...base3D(colors.purpleDeep, 3),
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.text,
    ...textShadow.emboss,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: -1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.orange + '14',
    borderWidth: 1,
    borderColor: colors.orange + '30',
  },
  streakCount: {
    fontFamily: fonts.displayExtra,
    fontSize: 13,
    color: colors.orange,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 8,
  },
  statCard: {
    width: '48%',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border + '40',
    backgroundColor: colors.card,
    overflow: 'hidden',
    gap: 6,
    minWidth: 140,
  },
  statBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: fonts.displayExtra,
    fontSize: 16,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  statTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 2,
  },
});
