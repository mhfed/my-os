import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors, glow, elevation } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { timing } from '@/theme/motion';
import { Counter } from '@/components/motion';
import type { MonthlyOverview } from '@/types/finance';
import { formatVND } from '@/utils/currency';

type SpendingOverviewProps = Pick<
  MonthlyOverview,
  'spent' | 'budgetUsed' | 'remaining'
>;

/** Top "SPENT THIS MONTH" hero — glass card, counting amount, animated budget bar. */
export function SpendingOverview({
  spent,
  budgetUsed,
  remaining,
}: SpendingOverviewProps) {
  const pct = Math.max(0, Math.min(1, budgetUsed));
  const isOver = budgetUsed >= 1 && spent > 0;
  const isWarning = !isOver && budgetUsed >= 0.9;

  const gradientColors: [string, string] = isOver
    ? [colors.red, '#E04545']
    : isWarning
      ? [colors.orange, '#D4883A']
      : [colors.purple, colors.teal];

  // Amount color tracks budget health, so the number itself signals trouble.
  const amountColor = isOver
    ? colors.red
    : isWarning
      ? colors.orange
      : colors.text;
  const glowColor = isOver
    ? colors.red
    : isWarning
      ? colors.orange
      : colors.teal;

  const reduce = useReducedMotion();
  const fill = useSharedValue(reduce ? pct : 0);
  useEffect(() => {
    fill.value = reduce ? pct : withDelay(220, withTiming(pct, timing.reveal));
  }, [pct, reduce, fill]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View
      style={[
        styles.card,
        glow(glowColor, isOver || isWarning ? 0.35 : 0.22, 22),
        isOver && styles.cardOver,
      ]}
    >
      <Text style={styles.label}>SPENT THIS MONTH</Text>
      <View testID="money-display">
        <Counter
          value={spent}
          prefix='₫'
          separator=','
          duration={timing.reveal.duration}
          style={[styles.amount, { color: amountColor }]}
        />
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, fillStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.footerMuted,
            isOver && { color: colors.red },
            isWarning && { color: colors.orange },
          ]}
        >
          {isOver
            ? 'Vượt ngân sách'
            : isWarning
              ? 'Sắp đến giới hạn'
              : `${Math.round(pct * 100)}% of budget`}
        </Text>
        <Text testID="money-display" style={[styles.footerLeft, isOver && { color: colors.red }]}>
          {isOver
            ? `+${formatVND(Math.abs(remaining))}`
            : `${formatVND(remaining)} left`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...elevation.card,
  },
  cardOver: {
    borderColor: colors.red,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  amount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 34,
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 16,
    padding: 0,
  },
  track: {
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.track,
    marginBottom: 10,
    overflow: 'hidden',
  },
  fillWrap: {
    height: 9,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMuted: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  footerLeft: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.teal,
  },
});
