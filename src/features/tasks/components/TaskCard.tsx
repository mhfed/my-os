import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, IconName } from '@/theme/icons';
import type { Priority, Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  timeLabel: string;
  overdue: boolean;
  onToggle: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

/** Color used for the priority icon. */
function priorityColor(priority: Priority): string {
  switch (priority) {
    case 'P0':
      return colors.red;
    case 'P1':
      return colors.orange;
    default:
      return colors.teal;
  }
}

/** Icon name for each priority level — matches Jira arrow semantics. */
function priorityIcon(priority: Priority): IconName {
  switch (priority) {
    case 'P0':
      return 'signal-cellular-3';
    case 'P1':
      return 'signal-cellular-2';
    case 'P2':
      return 'signal-cellular-1';
    case 'P3':
      return 'signal-cellular-outline';
  }
}

/** A single task row: checkbox, title + time, priority badge. Toggles on press. */
export const TaskCard = memo(function TaskCard({
  task,
  timeLabel,
  overdue,
  onToggle,
  onToggleSubtask,
}: TaskCardProps) {
  const isOverdue = overdue;
  const priColor = priorityColor(task.priority);
  const hasSubtasks = !!task.subtasks?.length;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onToggle(task.id)}
        style={[
          styles.card,
          isOverdue && styles.cardOverdue,
          hasSubtasks && styles.cardWithSubtasks,
        ]}
      >
        {/* Glass overlay */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.04)',
            'rgba(255,255,255,0.01)',
            'rgba(255,255,255,0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents='none'
        />

        <View
          style={[
            styles.checkbox,
            task.done ? styles.checkboxDone : styles.checkboxUndone,
          ]}
        >
          {task.done && (
            <Icon name='check-bold' size={15} color={colors.white} />
          )}
        </View>

        <View style={styles.body}>
          <Text
            style={[styles.title, task.done && styles.titleDone]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <Text
            style={[
              styles.time,
              isOverdue ? styles.timeOverdue : styles.timeToday,
            ]}
          >
            {timeLabel}
          </Text>
        </View>

        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: tint(priColor, '18') },
          ]}
        >
          <Icon name={priorityIcon(task.priority)} size={14} color={priColor} />
        </View>
      </Pressable>

      {hasSubtasks && !task.done && (
        <View style={styles.subtasksContainer}>
          {task.subtasks!.map((sub) => (
            <Pressable
              key={sub.id}
              style={styles.subtaskRow}
              onPress={() =>
                onToggleSubtask && onToggleSubtask(task.id, sub.id)
              }
            >
              <View
                style={[
                  styles.subtaskCheckbox,
                  sub.done ? styles.checkboxDone : styles.checkboxUndone,
                ]}
              >
                {sub.done && (
                  <Icon name='check-bold' size={11} color={colors.white} />
                )}
              </View>
              <Text
                style={[styles.subtaskTitle, sub.done && styles.titleDone]}
                numberOfLines={1}
              >
                {sub.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    width: 28,
    height: 28,
    borderRadius: 14,
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
  time: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    marginTop: 3,
  },
  timeOverdue: {
    color: colors.red,
  },
  timeToday: {
    color: colors.muted,
  },
  priorityBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtasksContainer: {
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: glass.rim,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingLeft: 48,
    gap: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
});
