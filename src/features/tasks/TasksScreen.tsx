import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { GamePanel } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { taskTimeLabel, useTasksStore } from '@/store/tasksStore';
import { useGoalStore } from '@/store/goalStore';
import type { Task } from '@/types/task';

import { AddTaskModal } from './components/AddTaskModal';
import { FilterPills } from './components/FilterPills';
import { SectionHeader } from './components/SectionHeader';
import { TaskCard } from './components/TaskCard';

const FAB_GRADIENT = [colors.blue, colors.blueDeep] as const;

// ---------------------------------------------------------------------------
// FlashList flattened list types
// ---------------------------------------------------------------------------

type SectionTone = 'overdue' | 'today' | 'upcoming' | 'completed' | 'anytime';

interface SectionItem {
  kind: 'section';
  id: string;
  label: string;
  count: number;
  tone: SectionTone;
}

interface TaskItem {
  kind: 'task';
  id: string;
  task: Task;
  timeLabel: string;
  overdue: boolean;
  goalTitle?: string;
}

type ListItem = SectionItem | TaskItem;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** Tasks screen (DESIGN_SPEC §5.2) — virtualized sectioned list + add FAB. */
export function TasksScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const ready = useTasksStore((s) => s.ready);
  const activeFilter = useTasksStore((s) => s.activeFilter);
  const goals = useGoalStore((s) => s.goals);
  const init = useTasksStore((s) => s.init);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const toggleSubtask = useTasksStore((s) => s.toggleSubtask);
  const setFilter = useTasksStore((s) => s.setFilter);

  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  // --- Derived data (all memo'd) ---
  const activeCount = useMemo(
    () => useTasksStore.getState().activeCount(),
    [tasks],
  );
  const overdueCount = useMemo(
    () => useTasksStore.getState().overdueCount(),
    [tasks],
  );

  // goalId -> title lookup so each task row can show its contributing goal.
  const goalTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const g of goals) map[g.id] = g.title;
    return map;
  }, [goals]);

  const flattenedList = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    const goalTitleOf = (task: Task) =>
      task.goalId ? goalTitleById[task.goalId] : undefined;

    const startToDay = new Date().setHours(0, 0, 0, 0);
    const DAY_MS = 86_400_000;

    if (activeFilter === 'Pending') {
      const pendingTasks = tasks.filter((t) => !t.done);

      const groups = new Map<number, Task[]>();
      const anytimeTasks: Task[] = [];

      for (const t of pendingTasks) {
        if (t.dueDate != null) {
          const d = new Date(t.dueDate);
          const dayStart = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
          ).getTime();
          if (!groups.has(dayStart)) groups.set(dayStart, []);
          groups.get(dayStart)!.push(t);
        } else {
          anytimeTasks.push(t);
        }
      }

      const sortedDays = Array.from(groups.keys()).sort((a, b) => a - b);

      for (const dayStart of sortedDays) {
        const dayTasks = groups.get(dayStart)!;
        dayTasks.sort((a, b) => a.dueDate! - b.dueDate!);

        const diffDays = Math.round((dayStart - startToDay) / DAY_MS);
        let label = '';
        if (diffDays === 0) label = 'Hôm nay';
        else if (diffDays === -1) label = 'Hôm qua';
        else if (diffDays === 1) label = 'Ngày mai';
        else {
          const d = new Date(dayStart);
          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          label = `${weekdays[d.getDay()]}, ${d.getDate()} Thg ${d.getMonth() + 1}`;
        }

        let tone: SectionTone = 'today';
        if (diffDays < 0) tone = 'overdue';
        else if (diffDays > 0) tone = 'upcoming';

        items.push({
          kind: 'section',
          id: `section-day-${dayStart}`,
          label: label.toUpperCase(),
          count: dayTasks.length,
          tone,
        });
        for (const task of dayTasks) {
          items.push({
            kind: 'task',
            id: task.id,
            task,
            timeLabel: taskTimeLabel(task),
            overdue: diffDays < 0,
            goalTitle: goalTitleOf(task),
          });
        }
      }

      if (anytimeTasks.length > 0) {
        anytimeTasks.sort((a, b) => b.createdAt - a.createdAt);
        items.push({
          kind: 'section',
          id: 'section-anytime',
          label: 'SẮP XẾP SAU',
          count: anytimeTasks.length,
          tone: 'anytime',
        });
        for (const task of anytimeTasks) {
          items.push({
            kind: 'task',
            id: task.id,
            task,
            timeLabel: taskTimeLabel(task),
            overdue: false,
            goalTitle: goalTitleOf(task),
          });
        }
      }
    } else {
      const completedTasks = tasks.filter((t) => t.done);

      const groups = new Map<number, Task[]>();

      for (const t of completedTasks) {
        const time = t.completedAt ?? t.createdAt;
        const d = new Date(time);
        const dayStart = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
        ).getTime();
        if (!groups.has(dayStart)) groups.set(dayStart, []);
        groups.get(dayStart)!.push(t);
      }

      const sortedDays = Array.from(groups.keys()).sort((a, b) => b - a);

      for (const dayStart of sortedDays) {
        const dayTasks = groups.get(dayStart)!;
        dayTasks.sort(
          (a, b) =>
            (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt),
        );

        const diffDays = Math.round((dayStart - startToDay) / DAY_MS);
        let label = '';
        if (diffDays === 0) label = 'Hôm nay';
        else if (diffDays === -1) label = 'Hôm qua';
        else {
          const d = new Date(dayStart);
          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          label = `${weekdays[d.getDay()]}, ${d.getDate()} Thg ${d.getMonth() + 1}`;
        }

        items.push({
          kind: 'section',
          id: `section-done-${dayStart}`,
          label: label.toUpperCase(),
          count: dayTasks.length,
          tone: 'completed',
        });
        for (const task of dayTasks) {
          items.push({
            kind: 'task',
            id: task.id,
            task,
            timeLabel: taskTimeLabel(task),
            overdue: false,
            goalTitle: goalTitleOf(task),
          });
        }
      }
    }

    return items;
  }, [tasks, activeFilter, goalTitleById]);

  const getItemType = useCallback((item: ListItem): string => item.kind, []);
  const keyExtractor = useCallback((item: ListItem): string => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'section') {
        return (
          <SectionHeader
            label={item.label}
            count={item.count}
            tone={item.tone}
          />
        );
      }
      return (
        <TaskCard
          task={item.task}
          timeLabel={item.timeLabel}
          overdue={item.overdue}
          goalTitle={item.goalTitle}
          onToggle={toggleTask}
          onToggleSubtask={toggleSubtask}
        />
      );
    },
    [toggleTask, toggleSubtask],
  );

  const renderListHeader = useCallback(
    () => (
      <AnimatedCard index={0} style={styles.headerWrap}>
        <GamePanel style={styles.headerPanel}>
          <View style={styles.header}>
            <Text style={styles.title}>Tasks</Text>
            <Text style={styles.subtitle}>
              {activeCount} cần làm · {overdueCount} quá hạn
            </Text>
          </View>
        </GamePanel>
      </AnimatedCard>
    ),
    [activeCount, overdueCount],
  );

  if (!ready) return <View style={styles.screen} />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Screen-wide top glow */}
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      <FilterPills active={activeFilter} onSelect={setFilter} />

      <FlashList
        data={flattenedList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        ListHeaderComponent={renderListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <PressableScale style={styles.fab} onPress={() => setAddVisible(true)} scaleTo={0.93} haptic='medium'>
        <LinearGradient
          colors={FAB_GRADIENT}
          start={{ x: 0.17, y: 0 }}
          end={{ x: 0.83, y: 1 }}
          style={styles.fabGradient}
        >
          <Icon name='plus' size={28} color={colors.white} />
        </LinearGradient>
      </PressableScale>

      <AddTaskModal visible={addVisible} onClose={() => setAddVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerPanel: {
    paddingVertical: 2,
  },
  header: {
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: spacing.tabClear,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.tabClear,
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    shadowColor: colors.blue,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
