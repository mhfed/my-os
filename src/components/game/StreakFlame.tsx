import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, glass, glow, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';

interface StreakFlameProps {
  /** Streak length in days. Drives the flame's heat (color). */
  count: number;
  /** Optional trailing label, e.g. "ngày" or a habit name. */
  label?: string;
  size?: number;
  /** Render as a standalone flame+number without the pill chrome. */
  bare?: boolean;
  style?: ViewStyle;
}

/**
 * Streak flame — the flame heats from orange → hot pink as the streak grows
 * (DESIGN_SPEC §3). Used on Habits, Journal and Today.
 */
function heatColor(count: number): string {
  if (count >= 30) return colors.pinkDeep; // hot pink — on fire
  if (count >= 14) return colors.red;
  if (count >= 7) return colors.orange;
  return colors.amber;
}

export function StreakFlame({
  count,
  label,
  size = 18,
  bare = false,
  style,
}: StreakFlameProps) {
  const color = heatColor(count);
  const content = (
    <>
      <View style={glow(color, 0.5, 8)}>
        <Icon name='fire' size={size} color={color} />
      </View>
      <Text style={[styles.count, { fontSize: size - 4 }]}>
        {count}
        {label ? <Text style={styles.label}> {label}</Text> : null}
      </Text>
    </>
  );

  if (bare) return <View style={[styles.bare, style]}>{content}</View>;
  return <View style={[styles.pill, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: glass.rim,
  },
  bare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  count: {
    fontFamily: fonts.displayBold,
    color: colors.text,
  },
  label: {
    fontFamily: fonts.display,
    color: colors.muted,
    fontSize: 13,
  },
});
