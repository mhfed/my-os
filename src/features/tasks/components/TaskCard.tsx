import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import type { Priority, Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  timeLabel: string;
  overdue: boolean;
  onToggle: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

/** Color used for the priority badge text + tinted background. */
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

/** A single task row: checkbox, title + time, priority badge. Toggles on press. */
export function TaskCard({
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
          <Text style={[styles.title, task.done && styles.titleDone]}>
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

        <View style={[styles.badge, { backgroundColor: tint(priColor) }]}>
          <Text style={[styles.badgeText, { color: priColor }]}>
            {task.priority}
          </Text>
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
              <Text style={[styles.subtaskTitle, sub.done && styles.titleDone]}>
                {sub.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardWithSubtasks: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  cardOverdue: {
    borderLeftWidth: 4,
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
    borderWidth: 2,
    borderColor: colors.greenDeep,
  },
  checkboxUndone: {
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.track,
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
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontFamily: fonts.displayBold,
    fontSize: 11,
  },
  subtasksContainer: {
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: colors.white,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
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
