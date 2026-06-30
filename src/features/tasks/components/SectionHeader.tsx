import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

interface SectionHeaderProps {
  label: string;
  count: number;
  /** Color of the leading dot + (for overdue) the label text. */
  tone: 'overdue' | 'today';
}

/** Section heading: colored dot + uppercase label + muted mono count. */
export function SectionHeader({ label, count, tone }: SectionHeaderProps) {
  const isOverdue = tone === 'overdue';
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.dot,
          { backgroundColor: isOverdue ? colors.red : colors.purple },
        ]}
      />
      <Text
        style={[
          styles.label,
          isOverdue ? styles.labelOverdue : styles.labelToday,
        ]}
      >
        {label}
      </Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  labelOverdue: {
    color: colors.red,
    letterSpacing: 0.3,
  },
  labelToday: {
    color: colors.text,
    letterSpacing: 0.3,
  },
  count: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
  },
});
