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
import { AnimatedCard } from '@/components/motion';
import { taskTimeLabel, useTasksStore } from '@/store/tasksStore';
import type { Task } from '@/types/task';

import { AddTaskModal } from './components/AddTaskModal';
import { FilterPills } from './components/FilterPills';
import { SectionHeader } from './components/SectionHeader';
import { TaskCard } from './components/TaskCard';

const FAB_GRADIENT = [colors.blue, colors.blueDeep] as const;

// ---------------------------------------------------------------------------
// FlashList flattened list types
// ---------------------------------------------------------------------------

type SectionTone = 'overdue' | 'today' | 'completed';

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

  const flattenedList = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    const showOverdue = activeFilter !== 'Today';

    const overdueTasks = tasks.filter(
      (t) => !t.done && useTasksStore.getState().sectionOf(t) === 'overdue',
    );
    if (showOverdue && overdueTasks.length > 0) {
      items.push({ kind: 'section', id: 'section-overdue', label: 'QUÁ HẠN', count: overdueTasks.length, tone: 'overdue' });
      for (const task of overdueTasks) {
        items.push({ kind: 'task', id: task.id, task, timeLabel: taskTimeLabel(task), overdue: true });
      }
    }

    const todayTasks = tasks.filter(
      (t) => !t.done && useTasksStore.getState().sectionOf(t) === 'today',
    );
    items.push({ kind: 'section', id: 'section-today', label: 'HÔM NAY', count: todayTasks.length, tone: 'today' });
    for (const task of todayTasks) {
      items.push({ kind: 'task', id: task.id, task, timeLabel: taskTimeLabel(task), overdue: false });
    }

    const completedTasks = tasks
      .filter((t) => t.done)
      .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt));
    if (completedTasks.length > 0) {
      items.push({ kind: 'section', id: 'section-completed', label: 'ĐÃ XONG', count: completedTasks.length, tone: 'completed' });
      for (const task of completedTasks) {
        items.push({ kind: 'task', id: task.id, task, timeLabel: taskTimeLabel(task), overdue: false });
      }
    }

    return items;
  }, [tasks, activeFilter]);

  const getItemType = useCallback((item: ListItem): string => item.kind, []);
  const keyExtractor = useCallback((item: ListItem): string => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'section') {
        return <SectionHeader label={item.label} count={item.count} tone={item.tone} />;
      }
      return (
        <TaskCard
          task={item.task}
          timeLabel={item.timeLabel}
          overdue={item.overdue}
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

      <Pressable style={styles.fab} onPress={() => setAddVisible(true)}>
        <LinearGradient
          colors={FAB_GRADIENT}
          start={{ x: 0.17, y: 0 }}
          end={{ x: 0.83, y: 1 }}
          style={styles.fabGradient}
        >
          <Icon name='plus' size={28} color={colors.white} />
        </LinearGradient>
      </Pressable>

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
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 18,
    shadowColor: colors.blue,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
