import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, G, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';

export const DashboardProductivity = memo(function DashboardProductivity() {
  const router = useRouter();
  const tasksReady = useTasksStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const tasks = useTasksStore((s) => s.tasks);
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);

  if (!tasksReady || !habitsReady) return null;

  const sectionOf = useTasksStore.getState().sectionOf;
  const todayTasks = tasks.filter((t) => sectionOf(t) === 'today');
  const doneTasks = todayTasks.filter((t) => t.done).length;
  const taskTotal = todayTasks.length;

  const visibleTasks = todayTasks.filter((t) => !t.done).slice(0, 3);
  const toggleTask = useTasksStore.getState().toggleTask;

  const trends = useMemo(() => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const list = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const completedTasksCount = tasks.filter(
        (t) => t.done && t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd
      ).length;

      const completedHabitsCount = logs.filter(
        (l) => l.date === dateStr && l.done
      ).length;

      list.push({
        label: dayNames[d.getDay()],
        total: completedTasksCount + completedHabitsCount,
      });
    }
    return list;
  }, [tasks, logs]);

  const maxVal = Math.max(...trends.map((t) => t.total), 1);

  const chartHeight = 56;
  const barWidth = 8;
  const groupGap = 8;
  const totalWidth = trends.length * (barWidth + groupGap) - groupGap;

  return (
    <PressableScale
      onPress={() => router.push('/(tabs)/tasks')}
      scaleTo={0.98}
      haptic='light'
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={[styles.iconWrap, { backgroundColor: colors.blue + '12' }]}>
            <Icon name='checkbox-marked-outline' size={16} color={colors.blue} />
          </View>
          <Text style={styles.headerTitle}>Hiệu suất & Công việc</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>
            Xong {doneTasks}/{taskTotal}
          </Text>
          <Icon name='chevron-right' size={14} color={colors.tabInactive} />
        </View>
      </View>

      <View style={styles.splitContent}>
        {/* Left Column: Today's Tasks */}
        <View style={styles.leftCol}>
          <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
          {visibleTasks.length > 0 ? (
            <View style={styles.taskList}>
              {visibleTasks.map((t) => (
                <PressableScale
                  key={t.id}
                  onPress={() => toggleTask(t.id)}
                  scaleTo={0.96}
                  haptic='light'
                  style={styles.taskRow}
                >
                  <View style={styles.checkbox}>
                    {t.done && <View style={styles.checkDot} />}
                  </View>
                  <Text style={styles.taskText} numberOfLines={1}>
                    {t.title}
                  </Text>
                  {t.priority === 'P0' && <View style={styles.p0Badge} />}
                </PressableScale>
              ))}
            </View>
          ) : taskTotal > 0 ? (
            <Text style={styles.emptyText}>Xong hết rồi ✨</Text>
          ) : (
            <Text style={styles.emptyText}>Chưa có việc hôm nay</Text>
          )}
        </View>

        {/* Right Column: Weekly Productivity Spark bars */}
        <View style={styles.rightCol}>
          <Text style={styles.chartTitle}>Năng suất 7 ngày</Text>
          <View style={styles.chartContainer}>
            <Svg width={totalWidth} height={chartHeight}>
              <Defs>
                <LinearGradient id='prodGrad' x1='0' y1='0' x2='0' y2='1'>
                  <Stop offset='0' stopColor={colors.blue} />
                  <Stop offset='1' stopColor={colors.blueDeep} />
                </LinearGradient>
              </Defs>

              {trends.map((item, idx) => {
                const xPos = idx * (barWidth + groupGap);
                const barH = Math.max(3, (item.total / maxVal) * chartHeight);
                return (
                  <G key={idx}>
                    <Rect
                      x={xPos}
                      y={chartHeight - barH}
                      width={barWidth}
                      height={barH}
                      rx={2}
                      fill='url(#prodGrad)'
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Labels */}
            <View style={[styles.chartLabels, { width: totalWidth }]}>
              {trends.map((item, idx) => (
                <Text key={idx} style={styles.chartLabelText}>
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
    gap: 6,
  },
  countBadge: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.blue,
  },
  splitContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  leftCol: {
    flex: 1.25,
    justifyContent: 'center',
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
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
  },
  taskList: {
    gap: 1,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: radius.sm - 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDot: {
    width: 6,
    height: 6,
    borderRadius: 1.5,
    backgroundColor: colors.blue,
  },
  taskText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  p0Badge: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.red,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    paddingVertical: 6,
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
