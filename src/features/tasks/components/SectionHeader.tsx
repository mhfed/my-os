import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';

interface SectionHeaderProps {
  label: string;
  count: number;
  /** Color of the leading dot + (for overdue) the label text. */
  tone: 'overdue' | 'today' | 'completed' | 'upcoming' | 'anytime';
}

/** Section heading: colored dot + uppercase label + muted mono count. */
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
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
