import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import type { Priority, Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  timeLabel: string;
  overdue: boolean;
  onToggle: (id: string) => void;
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
export function TaskCard({ task, timeLabel, overdue, onToggle }: TaskCardProps) {
  const isOverdue = overdue;
  const priColor = priorityColor(task.priority);

  return (
    <Pressable
      onPress={() => onToggle(task.id)}
      style={[styles.card, isOverdue && styles.cardOverdue]}
    >
      <View
        style={[styles.checkbox, task.done ? styles.checkboxDone : styles.checkboxUndone]}
      >
        {task.done && <Icon name="check" size={13} color={colors.screenBg} />}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, task.done && styles.titleDone]}>{task.title}</Text>
        <Text style={[styles.time, isOverdue ? styles.timeOverdue : styles.timeToday]}>
          {timeLabel}
        </Text>
      </View>

      <View style={[styles.badge, { backgroundColor: tint(priColor) }]}>
        <Text style={[styles.badgeText, { color: priColor }]}>{task.priority}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardOverdue: {
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.purple,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  checkboxUndone: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  titleDone: {
    color: colors.tabInactive,
    textDecorationLine: 'line-through',
  },
  time: {
    fontFamily: fonts.monoRegular,
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
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
  },
});
