import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon, IconName } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import type { Priority, Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  timeLabel: string;
  overdue: boolean;
  goalTitle?: string;
  onToggle: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

function priorityColor(priority: Priority): string {
  switch (priority) {
    case 'P0': return colors.red;
    case 'P1': return colors.orange;
    default: return colors.teal;
  }
}

function priorityIcon(priority: Priority): IconName {
  switch (priority) {
    case 'P0': return 'signal-cellular-3';
    case 'P1': return 'signal-cellular-2';
    case 'P2': return 'signal-cellular-1';
    case 'P3': return 'signal-cellular-outline';
  }
}

export const TaskCard = memo(function TaskCard({
  task,
  timeLabel,
  overdue,
  goalTitle,
  onToggle,
  onToggleSubtask,
}: TaskCardProps) {
  const isOverdue = overdue;
  const priColor = priorityColor(task.priority);
  const hasSubtasks = !!task.subtasks?.length;

  return (
    <View style={styles.container}>
      <PressableScale
        onPress={() => onToggle(task.id)}
        scaleTo={0.98}
        haptic='light'
        style={[
          styles.card,
          isOverdue && styles.cardOverdue,
          hasSubtasks && styles.cardWithSubtasks,
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents='none'
        />

        <View style={[styles.checkbox, task.done ? styles.checkboxDone : styles.checkboxUndone]}>
          {task.done && <Icon name='check-bold' size={14} color={colors.white} />}
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.time, isOverdue ? styles.timeOverdue : styles.timeToday]}>
              {timeLabel}
            </Text>
            {goalTitle ? (
              <View style={styles.goalBadge}>
                <Icon name='target' size={10} color={colors.purple} />
                <Text style={styles.goalBadgeText} numberOfLines={1}>
                  {goalTitle}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={[styles.priorityBadge, { backgroundColor: tint(priColor, '18') }]}>
          <Icon name={priorityIcon(task.priority)} size={14} color={priColor} />
        </View>
      </PressableScale>

      {hasSubtasks && !task.done && (
        <View style={styles.subtasksContainer}>
          {task.subtasks!.map((sub) => (
            <PressableScale
              key={sub.id}
              style={styles.subtaskRow}
              onPress={() => onToggleSubtask && onToggleSubtask(task.id, sub.id)}
              scaleTo={0.97}
              haptic='light'
            >
              <View style={[styles.subtaskCheckbox, sub.done ? styles.checkboxDone : styles.checkboxUndone]}>
                {sub.done && <Icon name='check-bold' size={10} color={colors.white} />}
              </View>
              <Text style={[styles.subtaskTitle, sub.done && styles.titleDone]} numberOfLines={1}>
                {sub.title}
              </Text>
            </PressableScale>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  cardWithSubtasks: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  cardOverdue: {
    borderColor: tint(colors.red, '44'),
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.green,
    borderWidth: 1,
    borderColor: colors.greenDeep,
  },
  checkboxUndone: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
  },
  titleDone: {
    color: colors.tabInactive,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  time: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 160,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    backgroundColor: tint(colors.purple, '18'),
  },
  goalBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.purple,
    flexShrink: 1,
  },
  timeOverdue: {
    color: colors.red,
  },
  timeToday: {
    color: colors.muted,
  },
  priorityBadge: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtasksContainer: {
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: glass.rim,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingLeft: 40,
    gap: spacing.xs,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  subtaskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
});
