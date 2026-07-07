import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { PressableScale } from '@/components/motion';
import { formatVND, formatCompactVND } from '@/utils/currency';

interface FinanceSummaryHeaderProps {
  netWorth: number;
  totalBalance: number; // Cash balance
  totalSavings: number;
  totalReceivable: number;
  totalPayable: number;
  income: number;
  spent: number;
  period: 'monthly' | 'weekly';
  activeMonth: string;
  onPressBalance: () => void;
  onPressIncome: () => void;
  onPressExpense: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onExportCSV?: () => void;
}

export function FinanceSummaryHeader({
  netWorth,
  totalBalance,
  totalSavings,
  totalReceivable,
  totalPayable,
  income,
  spent,
  period,
  activeMonth,
  onPressBalance,
  onPressIncome,
  onPressExpense,
  onPrevMonth,
  onNextMonth,
  onExportCSV,
}: FinanceSummaryHeaderProps) {
  // Format Month name (e.g., 2026-07 -> Thg 7, 2026)
  const formatMonth = (monthKey: string) => {
    const [y, m] = monthKey.split('-');
    return `T${parseInt(m, 10)}/${y.slice(2)}`;
  };

  return (
    <View style={styles.container}>
      {/* Top Title & Utilities Row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>Tài chính</Text>
          <Text style={styles.subtitle}>Báo cáo tài sản ròng</Text>
        </View>

        <View style={styles.actions}>
          {onExportCSV && (
            <PressableScale onPress={onExportCSV} style={styles.iconBtn} haptic='light'>
              <Icon name='file-download' size={16} color={colors.muted} />
            </PressableScale>
          )}

          {period === 'monthly' && onPrevMonth && onNextMonth && (
            <View style={styles.stepper}>
              <PressableScale onPress={onPrevMonth} style={styles.stepperBtn} haptic='light'>
                <Icon name='chevron-left' size={14} color={colors.text} />
              </PressableScale>
              <Text style={styles.stepperLabel}>{formatMonth(activeMonth)}</Text>
              <PressableScale onPress={onNextMonth} style={styles.stepperBtn} haptic='light'>
                <Icon name='chevron-right' size={14} color={colors.text} />
              </PressableScale>
            </View>
          )}
        </View>
      </View>

      {/* Main Net Worth Display */}
      <View style={styles.netWorthSection}>
        <Text style={styles.netWorthLabel}>TÀI SẢN RÒNG (NET WORTH)</Text>
        <Text style={[styles.netWorthValue, { color: netWorth >= 0 ? colors.text : colors.red }]}>
          {formatVND(netWorth)}
        </Text>
      </View>

      {/* Thin Horizontal Asset Allocation Bar (No cards, just typography and vertical borders) */}
      <View style={styles.allocationBar}>
        <PressableScale onPress={onPressBalance} style={styles.allocItem} haptic='light'>
          <Text style={styles.allocLabel}>Tiền mặt</Text>
          <Text style={[styles.allocValue, { color: totalBalance >= 0 ? colors.text : colors.red }]}>
            {formatCompactVND(totalBalance)}
          </Text>
        </PressableScale>

        <View style={styles.divider} />

        <View style={styles.allocItem}>
          <Text style={styles.allocLabel}>Tiết kiệm</Text>
          <Text style={[styles.allocValue, { color: colors.teal }]}>
            {formatCompactVND(totalSavings)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.allocItem}>
          <Text style={styles.allocLabel}>Sẽ thu</Text>
          <Text style={[styles.allocValue, { color: colors.purple }]}>
            {formatCompactVND(totalReceivable)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.allocItem}>
          <Text style={styles.allocLabel}>Phải trả</Text>
          <Text style={[styles.allocValue, { color: colors.red }]}>
            {formatCompactVND(totalPayable)}
          </Text>
        </View>
      </View>

      {/* Sleek Period Summary (Income vs Expense) */}
      <View style={styles.summaryRow}>
        <PressableScale
          onPress={onPressIncome}
          style={[styles.summaryBlock, { borderLeftColor: tint(colors.green, '40') }]}
          haptic='light'
        >
          <Text style={styles.summaryLabel}>Thu nhập {period === 'monthly' ? 'tháng' : 'tuần'}</Text>
          <View style={styles.summaryAmountRow}>
            <Icon name='arrow-bottom-left' size={14} color={colors.green} />
            <Text style={[styles.summaryAmount, { color: colors.green }]}>
              {formatVND(income)}
            </Text>
          </View>
        </PressableScale>

        <PressableScale
          onPress={onPressExpense}
          style={[styles.summaryBlock, { borderLeftColor: tint(colors.red, '40') }]}
          haptic='light'
        >
          <Text style={styles.summaryLabel}>Đã chi tiêu {period === 'monthly' ? 'tháng' : 'tuần'}</Text>
          <View style={styles.summaryAmountRow}>
            <Icon name='arrow-top-right' size={14} color={colors.red} />
            <Text style={[styles.summaryAmount, { color: colors.red }]}>
              {formatVND(spent)}
            </Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    gap: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.text,
    paddingHorizontal: 8,
  },
  netWorthSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  netWorthLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1.2,
  },
  netWorthValue: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  allocationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  allocItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  allocLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  allocValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryBlock: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderLeftWidth: 3,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  summaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 14,
  },
});
