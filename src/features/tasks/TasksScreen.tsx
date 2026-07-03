import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { GamePanel } from '@/components/game';
import { AnimatedCard } from '@/components/motion';
import { FarmBackground } from '@/components/skia';
import { taskTimeLabel, useTasksStore } from '@/store/tasksStore';
import type { Task } from '@/types/task';

import { AddTaskModal } from './components/AddTaskModal';
import { FilterPills } from './components/FilterPills';
import { SectionHeader } from './components/SectionHeader';
import { TaskCard } from './components/TaskCard';

const FAB_GRADIENT = [colors.purple, '#5D52C9'] as const;

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

/** Tasks screen with FlashList -- virtualized, sectioned list + add FAB. */
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

    // Overdue section
    const overdueTasks = tasks.filter(
      (t) => !t.done && useTasksStore.getState().sectionOf(t) === 'overdue',
    );
    if (showOverdue && overdueTasks.length > 0) {
      items.push({
        kind: 'section',
        id: 'section-overdue',
        label: 'OVERDUE',
        count: overdueTasks.length,
        tone: 'overdue',
      });
      for (const task of overdueTasks) {
        items.push({
          kind: 'task',
          id: task.id,
          task,
          timeLabel: taskTimeLabel(task),
          overdue: true,
        });
      }
    }

    // Today section
    const todayTasks = tasks.filter(
      (t) => !t.done && useTasksStore.getState().sectionOf(t) === 'today',
    );
    items.push({
      kind: 'section',
      id: 'section-today',
      label: 'TODAY',
      count: todayTasks.length,
      tone: 'today',
    });
    for (const task of todayTasks) {
      items.push({
        kind: 'task',
        id: task.id,
        task,
        timeLabel: taskTimeLabel(task),
        overdue: false,
      });
    }

    // Completed section
    const completedTasks = tasks
      .filter((t) => t.done)
      .sort(
        (a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt),
      );
    if (completedTasks.length > 0) {
      items.push({
        kind: 'section',
        id: 'section-completed',
        label: 'COMPLETED',
        count: completedTasks.length,
        tone: 'completed',
      });
      for (const task of completedTasks) {
        items.push({
          kind: 'task',
          id: task.id,
          task,
          timeLabel: taskTimeLabel(task),
          overdue: false,
        });
      }
    }

    return items;
  }, [tasks, activeFilter]);

  const getItemType = useCallback(
    (item: ListItem): string => item.kind,
    [],
  );

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
          onToggle={toggleTask}
          onToggleSubtask={toggleSubtask}
        />
      );
    },
    [toggleTask, toggleSubtask],
  );

  const renderListHeader = useCallback(
    () => (
      <>
        <AnimatedCard index={0} style={styles.headerWrap}>
          <GamePanel style={styles.headerPanel}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Tasks</Text>
                <Text style={styles.subtitle}>
                  {activeCount} active · {overdueCount} overdue
                </Text>
              </View>
              <Pressable
                style={styles.addButton}
                onPress={() => setAddVisible(true)}
              >
                <Icon name='plus' size={22} color={colors.screenBg} />
              </Pressable>
            </View>
          </GamePanel>
        </AnimatedCard>
        <FilterPills active={activeFilter} onSelect={setFilter} />
      </>
    ),
    [activeCount, overdueCount, activeFilter, setFilter],
  );

  if (!ready) {
    return <View style={styles.screen} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FarmBackground domain='tasks' />
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

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
    paddingTop: 8,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  headerPanel: {
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: fonts.semibold,
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
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 110,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 18,
    shadowColor: colors.purple,
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
