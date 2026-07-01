import { StyleSheet, Text, View } from 'react-native';

import { useDebtStore } from '@/store/debtStore';
import { useSavingsStore } from '@/store/savingsStore';
import { base3D, colors, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { formatCompactVND } from '@/utils/currency';

/** Net worth summary - designed to sit inside a GamePanel */
export function NetWorthWidget() {
  useDebtStore((s) => s.entries);
  useDebtStore((s) => s.payments);
  const getSummary = useDebtStore((s) => s.getSummary);
  const goals = useSavingsStore((s) => s.goals);

  const summary = getSummary();
  const { totalReceivable, totalPayable } = summary;

  const totalSavings = goals
    .filter((g) => g.status === 'active')
    .reduce((sum, g) => sum + g.currentAmount, 0);

  if (totalSavings === 0 && totalReceivable === 0 && totalPayable === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🪙</Text>
        <Text style={styles.emptyText}>No assets or debts recorded yet</Text>
      </View>
    );
  }

  const netWorth = totalSavings + totalReceivable - totalPayable;
  const isPositive = netWorth >= 0;
  const netWorthColor = isPositive ? colors.green : colors.red;
  const netWorthDeep = isPositive ? colors.greenDeep : colors.redDeep;

  return (
    <>
      {/* Net worth headline */}
      <View style={[styles.mainRow, base3D(netWorthDeep, 3)]}>
        <View style={styles.mainRowInner}>
          <View style={styles.mainLeft}>
            <Text style={styles.netLabel}>Net Worth</Text>
            <Text style={[styles.netValue, { color: netWorthColor }]}>
              {formatCompactVND(netWorth)}
            </Text>
          </View>
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: isPositive ? colors.green : colors.red },
            ]}
          >
            <Icon
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={20}
              color={colors.white}
            />
          </View>
        </View>
      </View>

      {/* Breakdown */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <View
            style={[styles.iconBubble, base3D(colors.tealDeep, 2)]}
          >
            <Icon name='piggy-bank' size={16} color={colors.white} />
          </View>
          <View style={styles.breakdownTextWrap}>
            <Text style={styles.breakdownLabel}>Tiết kiệm</Text>
            <Text style={[styles.breakdownValue, { color: colors.teal }]}>
              {formatCompactVND(totalSavings)}
            </Text>
          </View>
        </View>

        <View style={styles.breakdownItem}>
          <View
            style={[styles.iconBubble, base3D(colors.purpleDeep, 2)]}
          >
            <Icon name='tray-arrow-down' size={16} color={colors.white} />
          </View>
          <View style={styles.breakdownTextWrap}>
            <Text style={styles.breakdownLabel}>Sẽ thu</Text>
            <Text style={[styles.breakdownValue, { color: colors.purple }]}>
              {formatCompactVND(totalReceivable)}
            </Text>
          </View>
        </View>

        <View style={styles.breakdownItem}>
          <View
            style={[styles.iconBubble, base3D(colors.redDeep, 2)]}
          >
            <Icon name='tray-arrow-up' size={16} color={colors.white} />
          </View>
          <View style={styles.breakdownTextWrap}>
            <Text style={styles.breakdownLabel}>Phải trả</Text>
            <Text style={[styles.breakdownValue, { color: colors.red }]}>
              {formatCompactVND(totalPayable)}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 26,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  mainRow: {
    borderRadius: radius.md,
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  mainRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mainLeft: {
    gap: 2,
  },
  netLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  netValue: {
    fontFamily: fonts.displayExtra,
    fontSize: 28,
    ...textShadow.emboss,
  },
  trendBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  breakdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.track,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  breakdownTextWrap: {
    flexShrink: 1,
  },
  breakdownLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  breakdownValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 12,
  },
});
