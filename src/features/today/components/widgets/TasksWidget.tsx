import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useTasksStore } from '@/store/tasksStore';
import type { Task, Priority } from '@/types/task';
import { TaskRow } from '../TaskRow';

const HIGH_PRIORITIES: Priority[] = ['P0', 'P1'];

export const TasksWidget = memo(function TasksWidget() {
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
  const incomplete = todaySection.filter((t) => !t.done);
  const visibleTasks: Task[] = incomplete.slice(0, 3);
  const ratio = total > 0 ? done / total : 0;

  // Priority breakdown
  const highPriority = incomplete.filter((t) => HIGH_PRIORITIES.includes(t.priority)).length;
  const hasOverdue = incomplete.some((t) => {
    if (!t.dueDate) return false;
    return t.dueDate < Date.now() && !t.done;
  });

  return (
    <WidgetCard
      domain='tasks'
      title='Nhiệm vụ'
      icon='checkbox-marked-outline'
      onPress={() => router.push('/(tabs)/tasks')}
    >
      {/* Top row */}
      <View style={styles.headerRow}>
        <Text style={styles.count}>{done}/{total}</Text>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={gradients.blue}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.round(ratio * 100)}%` }]}
          />
        </View>
      </View>

      {/* Alert chips */}
      {(highPriority > 0 || hasOverdue) && (
        <View style={styles.alertRow}>
          {highPriority > 0 && (
            <View style={[styles.alertChip, { backgroundColor: colors.red + '14' }]}>
              <Icon name='alert' size={11} color={colors.red} />
              <Text style={[styles.alertText, { color: colors.red }]}>
                {highPriority} ưu tiên cao
              </Text>
            </View>
          )}
          {hasOverdue && (
            <View style={[styles.alertChip, { backgroundColor: colors.orange + '14' }]}>
              <Icon name='clock-alert-outline' size={11} color={colors.orange} />
              <Text style={[styles.alertText, { color: colors.orange }]}>
                Quá hạn
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Task list */}
      {visibleTasks.length > 0 ? (
        <View style={styles.taskList}>
          {visibleTasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </View>
      ) : total > 0 ? (
        <Text style={styles.doneAll}>Hoàn thành hết rồi ✨</Text>
      ) : (
        <Text style={styles.empty}>Chưa có việc hôm nay</Text>
      )}
    </WidgetCard>
  );
});

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 20,
    color: colors.blue,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  alertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  alertText: {
    fontFamily: fonts.display,
    fontSize: 10,
  },
  taskList: {
    gap: 4,
  },
  doneAll: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.green,
    textAlign: 'center',
    paddingVertical: 10,
  },
  empty: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
