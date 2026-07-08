import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';

interface SectionHeaderProps {
  label: string;
  count: number;
  tone: 'overdue' | 'today' | 'completed' | 'upcoming' | 'anytime';
}

export const SectionHeader = memo(function SectionHeader({
  label,
  count,
  tone,
}: SectionHeaderProps) {
  const isOverdue = tone === 'overdue';
  const isCompleted = tone === 'completed';
  const isUpcoming = tone === 'upcoming';
  const isAnytime = tone === 'anytime';

  const accentColor = isOverdue
    ? colors.red
    : isCompleted
      ? colors.green
      : isUpcoming
        ? colors.orange
        : isAnytime
          ? colors.text
          : colors.blue;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: tint(accentColor, '18'),
            borderColor: tint(accentColor, '30'),
          },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      </View>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  count: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
  },
});
