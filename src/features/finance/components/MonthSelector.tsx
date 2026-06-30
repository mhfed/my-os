import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';

interface MonthSelectorProps {
  /** Pre-formatted month label, e.g. "June 2025". */
  month: string;
  onPrev: () => void;
  onNext: () => void;
}

/** Screen header: "Finance" title + the month stepper control. */
export function MonthSelector({ month, onPrev, onNext }: MonthSelectorProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Finance</Text>

      <View style={styles.stepper}>
        <TouchableOpacity
          onPress={onPrev}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Icon name="chevron-left" size={16} color={colors.muted} />
        </TouchableOpacity>

        <Text style={styles.month}>{month}</Text>

        <TouchableOpacity
          onPress={onNext}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Icon name="chevron-right" size={16} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 22,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  month: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
});
