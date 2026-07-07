import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, glass, gradients, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { PressableScale } from '@/components/motion';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';
import type { Task } from '@/types/task';
import type { HabitView } from '@/types/habit';

export const DualProgress = memo(function DualProgress() {
  const router = useRouter();
  const tasks = useTasksStore((s) => s.tasks);
  const tasksReady = useTasksStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const toggleHabit = useHabitsStore((s) => s.toggleToday);

  if (!tasksReady || !habitsReady) return null;

  // ── Tasks ──
  const sectionOf = useTasksStore.getState().sectionOf;
  const todayTasks = tasks.filter((t) => sectionOf(t) === 'today');
  const doneTasks = todayTasks.filter((t) => t.done).length;
  const taskTotal = todayTasks.length;
  const taskRatio = taskTotal > 0 ? doneTasks / taskTotal : 0;
  const incomplete = todayTasks.filter((t) => !t.done).slice(0, 3);

  // ── Habits ──
  const habitViews = useHabitsStore.getState().views();
  const doneHabits = useHabitsStore.getState().doneTodayCount();
  const habitTotal = habitViews.length;
  const habitRatio = habitTotal > 0 ? doneHabits / habitTotal : 0;
  const undoneHabits = habitViews.filter((h) => !h.doneToday).slice(0, 3);

  return (
    <View style={styles.row}>
      {/* ─── Tasks Card ─── */}
      <PressableScale
        style={styles.halfCard}
        onPress={() => router.push('/(tabs)/tasks')}
        scaleTo={0.97}
        haptic='light'
      >
        <View style={[styles.card, { borderColor: colors.blue + '25' }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.blue }]}>Nhiệm vụ</Text>
            <Text style={[styles.cardCount, { color: colors.blue }]}>
              {doneTasks}/{taskTotal}
            </Text>
          </View>
          <View style={styles.barTrack}>
            <LinearGradient
              colors={gradients.blue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.barFill, { width: `${Math.round(taskRatio * 100)}%` }]}
            />
          </View>
          {incomplete.length > 0 ? (
            <View style={styles.itemList}>
              {incomplete.map((t) => (
                <PressableScale
                  key={t.id}
                  onPress={() => toggleTask(t.id)}
                  scaleTo={0.96}
                  haptic='light'
                  style={styles.itemRow}
                >
                  <View style={styles.checkbox}>
                    {t.done && <View style={styles.checkDot} />}
                  </View>
                  <Text style={styles.itemText} numberOfLines={1}>{t.title}</Text>
                  {t.priority === 'P0' && <View style={styles.p0Badge} />}
                </PressableScale>
              ))}
            </View>
          ) : (
            <Text style={styles.doneText}>
              {taskTotal > 0 ? 'Hoàn thành hết ✨' : 'Chưa có việc'}
            </Text>
          )}
        </View>
      </PressableScale>

      {/* ─── Habits Card ─── */}
      <PressableScale
        style={styles.halfCard}
        onPress={() => router.push('/habits')}
        scaleTo={0.97}
        haptic='light'
      >
        <View style={[styles.card, { borderColor: colors.orange + '25' }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.orange }]}>Thói quen</Text>
            <Text style={[styles.cardCount, { color: colors.orange }]}>
              {doneHabits}/{habitTotal}
            </Text>
          </View>
          <View style={styles.barTrack}>
            <LinearGradient
              colors={gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.barFill, { width: `${Math.round(habitRatio * 100)}%` }]}
            />
          </View>
          {undoneHabits.length > 0 ? (
            <View style={styles.itemList}>
              {undoneHabits.map((h) => (
                <PressableScale
                  key={h.id}
                  onPress={() => toggleHabit(h.id)}
                  scaleTo={0.96}
                  haptic='light'
                  style={styles.itemRow}
                >
                  <View style={[styles.checkbox, styles.checkboxHabit]}>
                    {h.doneToday && <View style={[styles.checkDot, { backgroundColor: colors.green }]} />}
                  </View>
                  <Text style={[styles.itemText, { color: colors.muted }]} numberOfLines={1}>
                    {h.name}
                  </Text>
                </PressableScale>
              ))}
            </View>
          ) : (
            <Text style={styles.doneText}>
              {habitTotal > 0 ? 'Xong hết 🔥' : 'Chưa có thói quen'}
            </Text>
          )}
        </View>
      </PressableScale>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  halfCard: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
  },
  cardCount: {
    fontFamily: fonts.displayExtra,
    fontSize: 20,
  },
  barTrack: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  itemList: {
    gap: 6,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxHabit: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.blue,
  },
  p0Badge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
  },
  itemText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.text,
  },
  doneText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 6,
  },
});
