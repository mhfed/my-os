import { StyleSheet, Text, View } from 'react-native';

import { useDebtStore } from '@/store/debtStore';
import { useSavingsStore } from '@/store/savingsStore';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { formatCompactVND } from '@/utils/currency';

export function NetWorthWidget() {
  // Subscribe to entries/payments so re-renders fire on changes
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
    return null;
  }

  const netWorth = totalSavings + totalReceivable - totalPayable;
  const netWorthColor = netWorth >= 0 ? colors.teal : colors.red;

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.label}>Tài sản ròng</Text>
        <Text style={[styles.netWorthValue, { color: netWorthColor }]}>
          {formatCompactVND(netWorth)}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row — 3 columns */}
      <View style={styles.bottomRow}>
        <View style={styles.col}>
          <Text style={styles.colIcon}>💰</Text>
          <Text style={styles.colLabel}>Tiết kiệm</Text>
          <Text style={[styles.colValue, { color: totalSavings > 0 ? colors.teal : colors.muted }]}>
            {formatCompactVND(totalSavings)}
          </Text>
        </View>

        <View style={styles.col}>
          <Text style={styles.colIcon}>📥</Text>
          <Text style={styles.colLabel}>Sẽ thu</Text>
          <Text style={[styles.colValue, { color: totalReceivable > 0 ? '#7C6EF5' : colors.muted }]}>
            {formatCompactVND(totalReceivable)}
          </Text>
        </View>

        <View style={styles.col}>
          <Text style={styles.colIcon}>📤</Text>
          <Text style={styles.colLabel}>Phải trả</Text>
          <Text style={[styles.colValue, { color: totalPayable > 0 ? colors.red : colors.muted }]}>
            {formatCompactVND(totalPayable)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  netWorthValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  colIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  colLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  colValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 14,
  },
});
