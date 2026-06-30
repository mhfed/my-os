import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import type { HabitView } from '@/types/habit';

interface HabitPillProps {
  habit: HabitView;
  onToggle: (id: string) => void;
}

export function HabitPill({ habit, onToggle }: HabitPillProps) {
  const done = habit.doneToday;
  const contentColor = done ? colors.white : colors.muted;
  const iconName = habit.icon as IconName;

  const inner = (
    <>
      <Icon name={iconName} size={20} color={contentColor} />
      <Text style={[styles.label, { color: contentColor }]} numberOfLines={1}>
        {habit.name}
      </Text>
    </>
  );

  if (done) {
    return (
      <Pressable onPress={() => onToggle(habit.id)}>
        <LinearGradient
          colors={[colors.purple, '#5D52C9']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.pill, styles.pillDone]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.pill, styles.pillUndone]} onPress={() => onToggle(habit.id)}>
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: 70,
    height: 78,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
  },
  pillDone: {
    borderColor: colors.purple,
  },
  pillUndone: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
