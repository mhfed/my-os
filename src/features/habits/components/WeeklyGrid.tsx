import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import type { HabitView } from '@/types/habit';
import { lastNDays, weekdayLetter } from '@/utils/day';

interface WeeklyGridProps {
  views: HabitView[];
  onToggleLog: (habitId: string, date: string) => void;
}

/** Card with a fixed 64px label column + 7 equal day columns for each habit. */
export function WeeklyGrid({ views, onToggleLog }: WeeklyGridProps) {
  const days = lastNDays(7);

  return (
    <View style={styles.card}>
      <View style={[styles.row, styles.headerRow]}>
        <View style={styles.labelCell} />
        {days.map((day, i) => (
          <View key={i} style={styles.dayCell}>
            <Text style={styles.weekday}>{weekdayLetter(day)}</Text>
          </View>
        ))}
      </View>

      {views.map((view) => (
        <View key={view.id} style={[styles.row, styles.habitRow]}>
          <View style={styles.labelCell}>
            <Icon
              name={view.icon as IconName}
              size={14}
              color={colors.muted}
            />
          </View>
          {view.pattern.map((value, dayIndex) => (
            <View key={dayIndex} style={styles.dayCell}>
              <Pressable
                onPress={() => onToggleLog(view.id, days[dayIndex])}
                style={[
                  styles.square,
                  value === 1
                    ? { backgroundColor: view.color }
                    : styles.squareEmpty,
                ]}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 26,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRow: {
    marginBottom: 12,
  },
  habitRow: {
    marginBottom: 10,
  },
  labelCell: {
    width: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekday: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  square: {
    width: 22,
    height: 22,
    borderRadius: 7,
  },
  squareEmpty: {
    backgroundColor: colors.track,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
