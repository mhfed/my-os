import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { WidgetCard } from '../WidgetCard';
import { useTasksStore } from '@/store/tasksStore';
import type { Task } from '@/types/task';
import { TaskRow } from '../TaskRow';

export function TasksWidget() {
  const router = useRouter();
  const tasks = useTasksStore((s) => s.tasks);
  const tasksReady = useTasksStore((s) => s.ready);
  const toggleTask = useTasksStore((s) => s.toggleTask);

  if (!tasksReady) return null;

  const sectionOf = useTasksStore.getState().sectionOf;
  const todaySection = tasks.filter((t) => sectionOf(t) === 'today');
  const sortedToday = [...todaySection].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (b.dueDate ?? b.createdAt) - (a.dueDate ?? a.createdAt);
  });
  const total = todaySection.length;
  const done = todaySection.filter((t) => t.done).length;
  const visibleTasks: Task[] = sortedToday.slice(0, 2);
  const ratio = total > 0 ? done / total : 0;

  return (
    <WidgetCard
      domain='tasks'
      title='Tasks'
      icon='checkbox-marked-outline'
      onPress={() => router.push('/tasks')}
    >
      <View style={styles.headerRow}>
        <Text style={styles.count}>
          {done}/{total}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(ratio * 100)}%` },
            ]}
          />
        </View>
      </View>
      {visibleTasks.length > 0 ? (
        <View style={styles.taskList}>
          {visibleTasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>All clear ✨</Text>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 18,
    color: colors.blue,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.blue,
  },
  taskList: {
    gap: 6,
  },
  empty: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
