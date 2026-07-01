import { StyleSheet, Text, View } from 'react-native';

import { useDebtStore } from '@/store/debtStore';
import { useSavingsStore } from '@/store/savingsStore';
import { colors } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
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
        <Text style={styles.emptyText}>No assets or debts recorded yet</Text>
      </View>
    );
  }

  const netWorth = totalSavings + totalReceivable - totalPayable;
  const netWorthColor = netWorth >= 0 ? colors.teal : colors.red;

  return (
    <>
      {/* Net worth display */}
      <View style={styles.mainRow}>
        <Text style={styles.netLabel}>Net Worth</Text>
        <Text style={[styles.netValue, { color: netWorthColor }]}>
          {formatCompactVND(netWorth)}
        </Text>
      </View>

      {/* Breakdown */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: 'rgba(63,212,232,0.15)' },
            ]}
          >
            <Text style={styles.emoji}>💰</Text>
          </View>
          <View>
            <Text style={styles.breakdownLabel}>Tiết kiệm</Text>
            <Text style={[styles.breakdownValue, { color: colors.teal }]}>
              {formatCompactVND(totalSavings)}
            </Text>
          </View>
        </View>

        <View style={styles.breakdownItem}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: 'rgba(124,110,245,0.15)' },
            ]}
          >
            <Text style={styles.emoji}>📥</Text>
          </View>
          <View>
            <Text style={styles.breakdownLabel}>Sẽ thu</Text>
            <Text style={[styles.breakdownValue, { color: '#7C6EF5' }]}>
              {formatCompactVND(totalReceivable)}
            </Text>
          </View>
        </View>

        <View style={styles.breakdownItem}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: 'rgba(255,90,110,0.15)' },
            ]}
          >
            <Text style={styles.emoji}>📤</Text>
          </View>
          <View>
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
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  netLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  netValue: {
    fontFamily: fonts.displayExtra,
    fontSize: 24,
    ...textShadow.emboss,
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
    borderRadius: 14,
    backgroundColor: colors.track,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 14,
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
