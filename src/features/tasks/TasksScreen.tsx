import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { GamePanel } from '@/components/game';
import { AnimatedCard } from '@/components/motion';
import { SkiaBackground } from '@/components/skia';
import { taskTimeLabel, useTasksStore } from '@/store/tasksStore';

import { AddTaskModal } from './components/AddTaskModal';
import { FilterPills } from './components/FilterPills';
import { SectionHeader } from './components/SectionHeader';
import { TaskCard } from './components/TaskCard';

const FAB_GRADIENT = [colors.purple, '#5D52C9'] as const;

/** Phase 2 Tasks screen — header, filters, sectioned task list + add FAB. */
export function TasksScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const ready = useTasksStore((s) => s.ready);
  const activeFilter = useTasksStore((s) => s.activeFilter);
  const init = useTasksStore((s) => s.init);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const toggleSubtask = useTasksStore((s) => s.toggleSubtask);
  const setFilter = useTasksStore((s) => s.setFilter);
  const sectionOf = useTasksStore((s) => s.sectionOf);
  const todayTasksFn = useTasksStore((s) => s.todayTasks);
  const activeCountFn = useTasksStore((s) => s.activeCount);
  const overdueCountFn = useTasksStore((s) => s.overdueCount);

  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return <View style={styles.screen} />;
  }

  const activeCount = activeCountFn();
  const overdueCount = overdueCountFn();
  const overdueTasks = tasks.filter((task) => sectionOf(task) === 'overdue');
  const todayTasks = todayTasksFn();

  const completedTasks = tasks
    .filter((t) => t.done)
    .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt));

  const showOverdue = activeFilter !== 'Today';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SkiaBackground domain='tasks' intensity={0.36} />
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {showOverdue && overdueTasks.length > 0 && (
          <View style={styles.overdueSection}>
            <SectionHeader
              label='OVERDUE'
              count={overdueTasks.length}
              tone='overdue'
            />
            <View style={styles.list}>
              {overdueTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  timeLabel={taskTimeLabel(task)}
                  overdue
                  onToggle={toggleTask}
                  onToggleSubtask={toggleSubtask}
                />
              ))}
            </View>
          </View>
        )}

        <View>
          <SectionHeader label='TODAY' count={todayTasks.length} tone='today' />
          <View style={styles.list}>
            {todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                timeLabel={taskTimeLabel(task)}
                overdue={false}
                onToggle={toggleTask}
                onToggleSubtask={toggleSubtask}
              />
            ))}
          </View>
        </View>

        {completedTasks.length > 0 && (
          <View style={styles.completedSection}>
            <SectionHeader
              label='COMPLETED'
              count={completedTasks.length}
              tone='completed'
            />
            <View style={styles.list}>
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  timeLabel={taskTimeLabel(task)}
                  overdue={false}
                  onToggle={toggleTask}
                  onToggleSubtask={toggleSubtask}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 110,
  },
  overdueSection: {
    marginBottom: 28,
  },
  list: {
    gap: 10,
  },
  completedSection: {
    marginTop: 28,
    marginBottom: 12,
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
