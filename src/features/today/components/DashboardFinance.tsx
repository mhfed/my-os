import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, G, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { useFinanceStore } from '@/store/financeStore';
import { formatCompactVND, formatVND } from '@/utils/currency';

interface TrendItem {
  month: string;
  income: number;
  spent: number;
}

function shortMonthName(monthKey: string): string {
  const [, m] = monthKey.split('-');
  return `Th ${parseInt(m, 10)}`;
}

export const DashboardFinance = memo(function DashboardFinance() {
  const router = useRouter();
  const ready = useFinanceStore((s) => s.ready);
  const transactions = useFinanceStore((s) => s.transactions);

  if (!ready) return null;

  const storeState = useFinanceStore.getState();
  const overview = storeState.getOverview();
  const trendsRaw = storeState.getMonthlyTrends(5);

  const netWorth = useMemo(() => {
    let total = 0;
    for (const t of transactions) {
      if (t.type === 'income') total += t.amount;
      else total -= t.amount;
    }
    return total;
  }, [transactions]);

  const trends: TrendItem[] = useMemo(() => {
    return trendsRaw.map((d) => ({
      month: shortMonthName(d.month),
      income: d.income,
      spent: d.spent,
    }));
  }, [trendsRaw]);

  const pct = Math.min(100, Math.round(overview.budgetUsed * 100));
  const barGradient =
    pct > 100 ? gradients.red : pct > 80 ? gradients.gold : gradients.gem;

  const maxVal = Math.max(...trends.flatMap((t) => [t.income, t.spent]), 1);
  const chartHeight = 56;
  const barWidth = 6;
  const barGap = 3;
  const groupGap = 10;
  const groupWidth = barWidth * 2 + barGap;
  const totalWidth = trends.length * (groupWidth + groupGap) - groupGap;

  return (
    <PressableScale
      onPress={() => router.push('/finance')}
      scaleTo={0.98}
      haptic='light'
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={[styles.iconWrap, { backgroundColor: colors.gold + '12' }]}>
            <Icon name='wallet' size={16} color={colors.gold} />
          </View>
          <Text style={styles.headerTitle}>Tài chính</Text>
        </View>
        <Icon name='chevron-right' size={14} color={colors.tabInactive} />
      </View>

      <View style={styles.splitContent}>
        {/* Left column: Metrics */}
        <View style={styles.leftCol}>
          <View style={styles.netWorthWrap}>
            <Text style={styles.netWorthLabel}>TÀI SẢN RÒNG</Text>
            <Text testID="money-display" style={[styles.netWorthValue, netWorth < 0 && { color: colors.red }]} numberOfLines={1}>
              {formatCompactVND(netWorth)}
            </Text>
          </View>

          <View style={styles.budgetWrap}>
            <Text style={styles.budgetLabel} numberOfLines={1}>
              Ngân sách: <Text testID="money-display">{formatCompactVND(overview.spent)}</Text> / <Text testID="money-display">{formatCompactVND(overview.budget)}</Text>
            </Text>
            <View style={styles.progressTrack}>
              {overview.budget > 0 ? (
                <LinearGradient
                  colors={barGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${pct}%` }]}
                />
              ) : null}
            </View>
          </View>

          <View style={styles.minisRow}>
            <View style={styles.miniStat}>
              <Text testID="money-display" style={[styles.miniValue, { color: colors.green }]} numberOfLines={1}>
                +{formatCompactVND(overview.income)}
              </Text>
              <Text style={styles.miniLabel}>Thu</Text>
            </View>
            <View style={styles.miniStat}>
              <Text testID="money-display" style={[styles.miniValue, { color: colors.purple }]} numberOfLines={1}>
                {formatCompactVND(overview.saved)}
              </Text>
              <Text style={styles.miniLabel}>T.Kiệm</Text>
            </View>
          </View>
        </View>

        {/* Right column: Sparkline Bar Chart */}
        <View style={styles.rightCol}>
          <Text style={styles.chartTitle}>Xu hướng 5 tháng</Text>
          <View style={styles.chartContainer}>
            <Svg width={totalWidth} height={chartHeight}>
              <Defs>
                <SvgLinearGradient id='incGrad' x1='0' y1='0' x2='0' y2='1'>
                  <Stop offset='0' stopColor={colors.teal} />
                  <Stop offset='1' stopColor={colors.tealDeep} />
                </SvgLinearGradient>
                <SvgLinearGradient id='expGrad' x1='0' y1='0' x2='0' y2='1'>
                  <Stop offset='0' stopColor={colors.red} />
                  <Stop offset='1' stopColor={colors.redDeep} />
                </SvgLinearGradient>
              </Defs>

              {trends.map((item, idx) => {
                const xPos = idx * (groupWidth + groupGap);
                const incH = Math.max(3, (item.income / maxVal) * chartHeight);
                const expH = Math.max(3, (item.spent / maxVal) * chartHeight);

                return (
                  <G key={item.month}>
                    <Rect
                      x={xPos}
                      y={chartHeight - incH}
                      width={barWidth}
                      height={incH}
                      rx={1.5}
                      fill='url(#incGrad)'
                    />
                    <Rect
                      x={xPos + barWidth + barGap}
                      y={chartHeight - expH}
                      width={barWidth}
                      height={expH}
                      rx={1.5}
                      fill='url(#expGrad)'
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Chart Labels */}
            <View style={[styles.chartLabels, { width: totalWidth }]}>
              {trends.map((item) => (
                <Text key={item.month} style={styles.chartLabelText}>
                  {item.month.replace('Th ', '')}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
  },
  splitContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  leftCol: {
    flex: 1.25,
    gap: 10,
  },
  rightCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  netWorthWrap: {
    gap: 1,
  },
  netWorthLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 0.6,
  },
  netWorthValue: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
    ...textShadow.emboss,
  },
  budgetWrap: {
    gap: 4,
  },
  budgetLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  progressTrack: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  minisRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniStat: {
    flex: 1,
    gap: 1,
  },
  miniValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
  },
  miniLabel: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  chartTitle: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.muted,
    marginBottom: 6,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chartLabelText: {
    width: 15,
    textAlign: 'center',
    fontFamily: fonts.monoRegular,
    fontSize: 8,
    color: colors.muted,
  },
});
