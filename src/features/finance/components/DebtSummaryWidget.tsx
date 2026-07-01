import { StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { useDebtStore } from '@/store/debtStore';
import { formatCompactVND } from '@/utils/currency';

interface DebtSummaryWidgetProps {
  onPress: () => void;
}

/** Debt summary widget - designed to sit inside a GamePanel */
export function DebtSummaryWidget({ onPress }: DebtSummaryWidgetProps) {
  const getSummary = useDebtStore((s) => s.getSummary);
  const entries = useDebtStore((s) => s.entries);

  const summary = getSummary();
  const openCount = entries.filter((e) => e.status !== 'settled').length;

  const hasAlert = summary.overdueCount > 0 || summary.upcomingCount > 0;
  const isOverdue = summary.overdueCount > 0;

  if (
    openCount === 0 &&
    summary.totalReceivable === 0 &&
    summary.totalPayable === 0
  ) {
    return (
      <PressableScale style={styles.emptyRow} onPress={onPress} haptic='light'>
        <Icon name='handshake' size={20} color={colors.muted} />
        <Text style={styles.emptyText}>Thêm khoản nợ / cho vay</Text>
        <Icon name='chevron-right' size={16} color={colors.tabInactive} />
      </PressableScale>
    );
  }

  return (
    <>
      {/* Alert strip */}
      {hasAlert && (
        <View style={[styles.alertRow, isOverdue && styles.alertRowOverdue]}>
          <Text
            style={[
              styles.alertText,
              { color: isOverdue ? colors.red : colors.orange },
            ]}
          >
            {isOverdue
              ? `● ${summary.overdueCount} khoản quá hạn`
              : `⚠ ${summary.upcomingCount} khoản đến hạn trong 7 ngày`}
          </Text>
        </View>
      )}

      {/* Amounts */}
      <View style={styles.amountsRow}>
        <View style={styles.amountCol}>
          <View
            style={[
              styles.amountIcon,
              { backgroundColor: 'rgba(63,212,232,0.15)' },
            ]}
          >
            <Icon name='arrow-bottom-left' size={16} color={colors.teal} />
          </View>
          <Text style={styles.amountLabel}>Thu về</Text>
          <Text style={[styles.amountValue, { color: colors.teal }]}>
            +{formatCompactVND(summary.totalReceivable)}
          </Text>
        </View>

        <View style={styles.amountDivider} />

        <View style={styles.amountCol}>
          <View
            style={[
              styles.amountIcon,
              { backgroundColor: 'rgba(255,90,110,0.15)' },
            ]}
          >
            <Icon name='arrow-top-right' size={16} color={colors.red} />
          </View>
          <Text style={styles.amountLabel}>Phải trả</Text>
          <Text style={[styles.amountValue, { color: colors.red }]}>
            -{formatCompactVND(summary.totalPayable)}
          </Text>
        </View>
      </View>

      {/* View details button */}
      <PressableScale
        style={styles.detailsBtn}
        onPress={onPress}
        haptic='light'
      >
        <Text style={styles.detailsBtnText}>View details</Text>
        <Icon name='chevron-right' size={14} color={colors.teal} />
      </PressableScale>
    </>
  );
}

const styles = StyleSheet.create({
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  alertRow: {
    backgroundColor: 'rgba(255,167,38,0.12)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  alertRowOverdue: {
    backgroundColor: 'rgba(255,90,110,0.12)',
  },
  alertText: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  amountIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  amountLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  amountValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 16,
  },
  amountDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.track,
  },
  detailsBtnText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.teal,
  },
});
