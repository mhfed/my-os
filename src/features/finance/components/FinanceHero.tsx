import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, domains, glow, gradients, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { timing } from '@/theme/motion';
import { Counter, ShimmerView } from '@/components/motion';
import { IconBadge } from '@/components/game';
import { formatCompactVND } from '@/utils/currency';

interface FinanceHeroProps {
  /** Budget used fraction (0-1, may exceed 1 when over). */
  budgetUsed: number;
  /** Amount spent this month. */
  spent: number;
  /** Amount saved this month (income - spent). */
  saved: number;
  /** Income this month. */
  income: number;
  /** Total budget for the month (sum of category budgets). */
  budget: number;
  /** budget - spent (can be negative). */
  remaining: number;
}

/**
 * Finance hero — a budget dashboard: a big "remaining" headline, a chunky 3D
 * jelly progress bar (spent vs budget), and an Income/Spent/Saved stat footer.
 * The bar + headline + status carry the budget-health colour (teal → gold →
 * red). Replaces the old circular coin/orb.
 */
export function FinanceHero({
  budgetUsed,
  spent,
  saved,
  income,
  budget,
  remaining,
}: FinanceHeroProps) {
  const reduce = useReducedMotion();
  const hasBudget = budget > 0;
  const clamped = Math.max(0, Math.min(1, budgetUsed));
  const pct = Math.round(budgetUsed * 100);

  const isOver = hasBudget && remaining < 0;
  const isWarning = hasBudget && !isOver && clamped >= 0.9;
  const healthColor = !hasBudget
    ? domains.finance.accent
    : isOver
      ? colors.red
      : isWarning
        ? colors.orange
        : domains.finance.accent;
  const barGradient = isOver
    ? gradients.red
    : isWarning
      ? gradients.gold
      : gradients.gem;

  // Headline: remaining budget, or the overspend amount, or (no budget) spend.
  const headLabel = !hasBudget
    ? 'ĐÃ CHI THÁNG NÀY'
    : isOver
      ? 'VƯỢT NGÂN SÁCH'
      : 'CÒN LẠI';
  const headValue = !hasBudget ? spent : isOver ? spent - budget : remaining;

  const fill = useSharedValue(reduce ? clamped : 0);
  useEffect(() => {
    if (reduce) {
      fill.value = clamped;
      return;
    }
    fill.value = withDelay(180, withTiming(clamped, timing.reveal));
  }, [clamped, reduce, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <View style={styles.panel}>
      <LinearGradient
        colors={['rgba(30,202,211,0.16)', 'rgba(79,140,255,0.04)']}
        start={{ x: 0.08, y: 0.08 }}
        end={{ x: 0.92, y: 1 }}
        style={styles.aura}
        pointerEvents='none'
      />
      <View style={styles.halo} pointerEvents='none' />
      <ShimmerView width={340} height={260} duration={3500} />
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={styles.gloss}
        pointerEvents='none'
      />

      {/* Headline */}
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.headLabel}>{headLabel}</Text>
          <Counter
            value={headValue}
            prefix='₫'
            separator=','
            duration={timing.reveal.duration}
            style={[styles.headAmount, { color: healthColor }]}
          />
        </View>
        {hasBudget ? (
          <View
            style={[styles.pctChip, { backgroundColor: tint(healthColor, '22') }]}
          >
            <Text style={[styles.pctText, { color: healthColor }]}>{pct}%</Text>
          </View>
        ) : null}
      </View>

      {/* 3D jelly budget bar */}
      <View style={styles.barBlock}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFillWrap, fillStyle]}>
            <LinearGradient
              colors={barGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.barFillGrad}
            >
              <LinearGradient
                colors={gradients.gloss}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.barGloss}
                pointerEvents='none'
              />
            </LinearGradient>
          </Animated.View>
        </View>
        <View style={styles.barCaptions}>
          <Text style={styles.barCap}>{formatCompactVND(spent)}</Text>
          <Text style={styles.barCap}>
            {hasBudget ? formatCompactVND(budget) : 'Chưa đặt ngân sách'}
          </Text>
        </View>
      </View>

      {/* Stat footer */}
      <View style={styles.footer}>
        <View style={styles.statItem}>
          <IconBadge icon='arrow-bottom-left' color={colors.teal} size={34} iconSize={17} />
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: colors.teal }]}>
            {formatCompactVND(income)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <IconBadge icon='arrow-top-right' color={colors.red} size={34} iconSize={17} />
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={[styles.statValue, { color: colors.red }]}>
            {formatCompactVND(spent)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <IconBadge icon='piggy-bank' color={colors.green} size={34} iconSize={17} />
          <Text style={styles.statLabel}>Saved</Text>
          <Text
            style={[
              styles.statValue,
              { color: saved >= 0 ? colors.green : colors.red },
            ]}
          >
            {formatCompactVND(saved)}
          </Text>
        </View>
      </View>

      <Text style={[styles.status, { color: healthColor }]}>
        {!hasBudget
          ? '💡 Đặt ngân sách để theo dõi'
          : isOver
            ? '⚠️ Vượt ngân sách'
            : isWarning
              ? '⚡ Sắp đến giới hạn'
              : '✨ Đúng kế hoạch'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    ...glow(domains.finance.accent, 0.18, 20),
  },
  aura: {
    ...StyleSheet.absoluteFillObject,
  },
  halo: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(30,202,211,0.1)',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headText: {
    flex: 1,
  },
  headLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 32,
    letterSpacing: -1,
    padding: 0,
  },
  pctChip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontFamily: fonts.displayExtra,
    fontSize: 16,
  },
  barBlock: {
    marginTop: 14,
  },
  barTrack: {
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  barFillWrap: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  barFillGrad: {
    flex: 1,
    borderRadius: radius.pill,
  },
  barGloss: {
    position: 'absolute',
    top: 1,
    left: 3,
    right: 3,
    height: '46%',
    borderRadius: radius.pill,
  },
  barCaptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  barCap: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.muted,
  },
  statValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border,
  },
  status: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
});
