import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useDebtStore } from '@/store/debtStore';
import { formatCompactVND } from '@/utils/currency';

interface DebtSummaryWidgetProps {
  onPress: () => void;
}

export function DebtSummaryWidget({ onPress }: DebtSummaryWidgetProps) {
  const getSummary = useDebtStore((s) => s.getSummary);
  const entries = useDebtStore((s) => s.entries);

  const summary = getSummary();
  const openCount = entries.filter((e) => e.status !== 'settled').length;

  const hasAlert = summary.overdueCount > 0 || summary.upcomingCount > 0;
  const isOverdue = summary.overdueCount > 0;

  const alertStrip = hasAlert ? (
    <View style={styles.alertRow}>
      <Text style={[styles.alertText, { color: isOverdue ? colors.red : colors.orange }]}>
        {isOverdue
          ? `● ${summary.overdueCount} khoản quá hạn`
          : `⚠ ${summary.upcomingCount} khoản đến hạn trong 7 ngày`}
      </Text>
    </View>
  ) : null;

  if (openCount === 0 && summary.totalReceivable === 0 && summary.totalPayable === 0) {
    return (
      <Pressable style={styles.emptyCard} onPress={onPress}>
        <View style={styles.emptyMain}>
          <Icon name='handshake' size={20} color={colors.muted} />
          <Text style={styles.emptyText}>Thêm khoản nợ / cho vay</Text>
          <Icon name='chevron-right' size={16} color={colors.tabInactive} />
        </View>
        {alertStrip}
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Icon name='handshake' size={16} color={colors.purple} />
          <Text style={styles.title}>Sổ nợ</Text>
          {openCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{openCount}</Text>
            </View>
          )}
        </View>
        <Icon name='chevron-right' size={16} color={colors.tabInactive} />
      </View>

      <View style={styles.amounts}>
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Thu về</Text>
          <Text style={[styles.amountValue, { color: colors.teal }]}>
            +{formatCompactVND(summary.totalReceivable)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Phải trả</Text>
          <Text style={[styles.amountValue, { color: colors.red }]}>
            -{formatCompactVND(summary.totalPayable)}
          </Text>
        </View>
      </View>

      {alertStrip}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  emptyMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  badge: {
    backgroundColor: tint(colors.purple, '33'),
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.purple,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: 8,
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
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
});
