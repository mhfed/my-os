import { StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
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
          styles.badge,
          {
            backgroundColor: isOverdue
              ? tint(colors.red, '22')
              : tint(colors.blue, '22'),
            borderColor: isOverdue ? tint(colors.red, '44') : tint(colors.blue, '44'),
          },
        ]}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: isOverdue ? colors.red : colors.blue },
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
      </View>
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
  },
  labelOverdue: {
    color: colors.red,
    letterSpacing: 0.3,
  },
  labelToday: {
    color: colors.blue,
    letterSpacing: 0.3,
  },
  count: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
  },
});
