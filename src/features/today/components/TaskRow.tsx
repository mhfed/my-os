import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { taskTimeLabel } from '@/store/tasksStore';
import type { Priority, Task } from '@/types/task';

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

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
}

export function TaskRow({ task, onToggle }: TaskRowProps) {
  const priColor = priorityColor(task.priority);

  return (
    <Pressable style={styles.card} onPress={() => onToggle(task.id)}>
      <View style={[styles.checkbox, task.done ? styles.checkboxDone : styles.checkboxUndone]}>
        {task.done ? <Icon name="check" size={13} color="#0A0A0F" /> : null}
      </View>

      <View style={styles.middle}>
        <Text style={[styles.title, task.done && styles.titleDone]}>{task.title}</Text>
        <Text style={styles.time}>{taskTimeLabel(task)}</Text>
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
  middle: {
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
    color: colors.muted,
    marginTop: 3,
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
