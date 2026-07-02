import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useDebtStore } from '@/store/debtStore';
import { formatCompactVND } from '@/utils/currency';

export function DebtWidget() {
  const router = useRouter();
  const ready = useDebtStore((s) => s.ready);

  if (!ready) return null;

  const summary = useDebtStore.getState().getSummary();
  const entries = useDebtStore.getState().entries;
  const openCount = entries.filter((e) => e.status !== 'settled').length;

  if (openCount === 0) {
    return (
      <WidgetCard
        domain='finance'
        title='Công nợ'
        icon='cash-multiple'
        onPress={() => router.push('/(tabs)/finance')}
      >
        <Text style={styles.clearText}>Chưa có khoản nợ</Text>
      </WidgetCard>
    );
  }

  const hasReceivable = summary.totalReceivable > 0;
  const hasPayable = summary.totalPayable > 0;

  return (
    <WidgetCard
      domain='finance'
      title='Công nợ'
      icon='cash-multiple'
      onPress={() => router.push('/(tabs)/finance')}
    >
      <View style={styles.balanceRow}>
        {hasReceivable && (
          <View style={styles.balanceItem}>
            <View style={[styles.dot, { backgroundColor: colors.green }]} />
            <View>
              <Text style={[styles.balanceValue, { color: colors.green }]}>
                {formatCompactVND(summary.totalReceivable)}
              </Text>
              <Text style={styles.balanceLabel}>Cho vay</Text>
            </View>
          </View>
        )}
        {hasPayable && (
          <View style={styles.balanceItem}>
            <View style={[styles.dot, { backgroundColor: colors.red }]} />
            <View>
              <Text style={[styles.balanceValue, { color: colors.red }]}>
                {formatCompactVND(summary.totalPayable)}
              </Text>
              <Text style={styles.balanceLabel}>Đi vay</Text>
            </View>
          </View>
        )}
      </View>

      {(summary.overdueCount > 0 || summary.upcomingCount > 0) && (
        <View style={styles.alertRow}>
          {summary.overdueCount > 0 && (
            <View style={[styles.alertChip, styles.alertOverdue]}>
              <Icon name='alert-circle' size={12} color={colors.red} />
              <Text style={styles.alertOverdueText}>
                Quá hạn {summary.overdueCount}
              </Text>
            </View>
          )}
          {summary.upcomingCount > 0 && (
            <View style={[styles.alertChip, styles.alertUpcoming]}>
              <Icon name='calendar' size={12} color={colors.orange} />
              <Text style={styles.alertUpcomingText}>
                Sắp đến hạn {summary.upcomingCount}
              </Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.countText}>
        {openCount} khoản đang mở
      </Text>
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  clearText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceValue: {
    fontFamily: fonts.displayExtra,
    fontSize: 16,
  },
  balanceLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  alertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  alertOverdue: {
    backgroundColor: colors.red + '14',
  },
  alertOverdueText: {
    fontFamily: fonts.display,
    fontSize: 10,
    color: colors.red,
  },
  alertUpcoming: {
    backgroundColor: colors.orange + '14',
  },
  alertUpcomingText: {
    fontFamily: fonts.display,
    fontSize: 10,
    color: colors.orange,
  },
  countText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    marginTop: 6,
    textAlign: 'right',
  },
});
