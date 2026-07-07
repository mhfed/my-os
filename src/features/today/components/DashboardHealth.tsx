import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, G, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { useGymStore } from '@/store/gymStore';
import { useHabitsStore } from '@/store/habitsStore';

export const DashboardHealth = memo(function DashboardHealth() {
  const router = useRouter();
  const gymReady = useGymStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const history = useGymStore((s) => s.history);
  const isWorkoutActive = useGymStore((s) => s.isWorkoutActive);

  if (!gymReady) return null;

  const doneHabits = habitsReady ? useHabitsStore.getState().doneTodayCount() : 0;

  const todayStr = new Date().toDateString();
  const todayWorkouts = history.filter((w) => {
    const d = new Date(w.startTime).toDateString();
    return d === todayStr;
  });
  const totalExercisesToday = todayWorkouts.reduce(
    (sum, w) => sum + w.exercises.length, 0
  );

  const weekAgo = Date.now() - 7 * 86400000;
  const workoutDaysThisWeek = new Set(
    history
      .filter((w) => w.startTime > weekAgo)
      .map((w) => new Date(w.startTime).toDateString())
  ).size;

  const activityList = useMemo(() => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const list = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = date.toDateString();
      const hasWorkout = history.some(
        (w) => new Date(w.startTime).toDateString() === dateStr
      );
      list.push({
        label: dayNames[date.getDay()],
        active: hasWorkout,
      });
    }
    return list;
  }, [history]);

  const chartHeight = 32;
  const barWidth = 6;
  const groupGap = 10;
  const totalWidth = activityList.length * (barWidth + groupGap) - groupGap;

  return (
    <PressableScale
      onPress={() => router.push('/health')}
      scaleTo={0.98}
      haptic='light'
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={[styles.iconWrap, { backgroundColor: colors.pink + '12' }]}>
            <Icon name='heart-pulse' size={16} color={colors.pink} />
          </View>
          <Text style={styles.headerTitle}>Sức khỏe & Thể chất</Text>
        </View>
        <View style={styles.headerRight}>
          {isWorkoutActive ? (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Đang tập</Text>
            </View>
          ) : todayWorkouts.length > 0 ? (
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>Đã tập</Text>
            </View>
          ) : null}
          <Icon name='chevron-right' size={14} color={colors.tabInactive} />
        </View>
      </View>

      <View style={styles.splitContent}>
        {/* Left Column: Wellbeing Metrics */}
        <View style={styles.leftCol}>
          <View style={styles.metricRow}>
            <Text style={styles.metricValue}>{totalExercisesToday}</Text>
            <Text style={styles.metricLabel}>Bài tập hôm nay</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricValue}>{workoutDaysThisWeek}</Text>
            <Text style={styles.metricLabel}>Ngày tập / tuần</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricValue}>{doneHabits}</Text>
            <Text style={styles.metricLabel}>Thói quen hoàn thành</Text>
          </View>
        </View>

        {/* Right Column: Weekly Workout Activity Spark chart */}
        <View style={styles.rightCol}>
          <Text style={styles.chartTitle}>Luyện tập 7 ngày</Text>
          <View style={styles.chartContainer}>
            <Svg width={totalWidth} height={chartHeight}>
              <Defs>
                <LinearGradient id='healthGrad' x1='0' y1='0' x2='0' y2='1'>
                  <Stop offset='0' stopColor={colors.pink} />
                  <Stop offset='1' stopColor={colors.pinkDeep} />
                </LinearGradient>
              </Defs>

              {activityList.map((item, idx) => {
                const xPos = idx * (barWidth + groupGap);
                const barH = item.active ? 28 : 4;
                return (
                  <G key={idx}>
                    <Rect
                      x={xPos}
                      y={chartHeight - barH}
                      width={barWidth}
                      height={barH}
                      rx={item.active ? 2 : 1.5}
                      fill={item.active ? 'url(#healthGrad)' : colors.track}
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Labels */}
            <View style={[styles.chartLabels, { width: totalWidth }]}>
              {activityList.map((item, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.chartLabelText,
                    item.active && { color: colors.pink, fontFamily: fonts.monoSemibold }
                  ]}
                >
                  {item.label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: colors.pink + '20',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.pink + '30',
  },
  activeBadgeText: {
    fontFamily: fonts.displayBold,
    fontSize: 9,
    color: colors.pink,
  },
  doneBadge: {
    backgroundColor: colors.green + '20',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.green + '30',
  },
  doneBadgeText: {
    fontFamily: fonts.displayBold,
    fontSize: 9,
    color: colors.green,
  },
  splitContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  leftCol: {
    flex: 1.25,
    gap: 6,
  },
  rightCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.text,
    minWidth: 18,
  },
  metricLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  chartTitle: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.muted,
    marginBottom: 6,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chartLabelText: {
    width: 15,
    textAlign: 'center',
    fontFamily: fonts.monoRegular,
    fontSize: 8,
    color: colors.muted,
  },
});
