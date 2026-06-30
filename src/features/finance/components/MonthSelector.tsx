import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';

interface MonthSelectorProps {
  /** Pre-formatted month label, e.g. "June 2025". */
  month: string;
  onPrev: () => void;
  onNext: () => void;
  onManageRecurring?: () => void;
  onExportCSV?: () => void;
}

/** Screen header: "Finance" title + the month stepper control. */
export function MonthSelector({
  month,
  onPrev,
  onNext,
  onManageRecurring,
  onExportCSV,
}: MonthSelectorProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Finance</Text>

      <View style={styles.rightGroup}>
        {onExportCSV && (
          <TouchableOpacity
            onPress={onExportCSV}
            hitSlop={8}
            style={styles.iconBtn}
          >
            <Icon name='export' size={18} color={colors.text} />
          </TouchableOpacity>
        )}

        {onManageRecurring && (
          <TouchableOpacity
            onPress={onManageRecurring}
            hitSlop={8}
            style={styles.iconBtn}
          >
            <Icon name='calendar-sync' size={18} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={onPrev}
            hitSlop={8}
            accessibilityRole='button'
            accessibilityLabel='Previous month'
          >
            <Icon name='chevron-left' size={16} color={colors.muted} />
          </TouchableOpacity>

          <Text style={styles.month}>{month}</Text>

          <TouchableOpacity
            onPress={onNext}
            hitSlop={8}
            accessibilityRole='button'
            accessibilityLabel='Next month'
          >
            <Icon name='chevron-right' size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>
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
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
