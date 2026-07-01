import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, tint, base3D } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { GameButton } from '@/components/game';
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
        <View style={styles.emptyIconWrap}>
          <Icon name='handshake' size={20} color={colors.muted} />
        </View>
        <Text style={styles.emptyText}>Thêm khoản nợ / cho vay ✨</Text>
        <Icon name='chevron-right' size={16} color={colors.tabInactive} />
      </PressableScale>
    );
  }

  return (
    <>
      {/* Alert strip */}
      {hasAlert && (
        <View
          style={[
            styles.alertRow,
            {
              backgroundColor: isOverdue
                ? tint(colors.red, '1F')
                : tint(colors.orange, '1F'),
            },
          ]}
        >
          <Text
            style={[
              styles.alertText,
              { color: isOverdue ? colors.redDeep : colors.orangeDeep },
            ]}
          >
            {isOverdue
              ? `● ${summary.overdueCount} khoản quá hạn`
              : `⚡ ${summary.upcomingCount} khoản đến hạn trong 7 ngày`}
          </Text>
        </View>
      )}

      {/* Amounts */}
      <View style={styles.amountsRow}>
        <View style={styles.amountCol}>
          <View style={[styles.amountIconWrap, base3D(colors.greenDeep, 2)]}>
            <View style={[styles.amountIcon, { backgroundColor: colors.green }]}>
              <Icon name='arrow-bottom-left' size={16} color={colors.white} />
            </View>
          </View>
          <Text style={styles.amountLabel}>Thu về</Text>
          <Text style={[styles.amountValue, { color: colors.greenDeep }]}>
            +{formatCompactVND(summary.totalReceivable)}
          </Text>
        </View>

        <View style={styles.amountDivider} />

        <View style={styles.amountCol}>
          <View style={[styles.amountIconWrap, base3D(colors.redDeep, 2)]}>
            <View style={[styles.amountIcon, { backgroundColor: colors.red }]}>
              <Icon name='arrow-top-right' size={16} color={colors.white} />
            </View>
          </View>
          <Text style={styles.amountLabel}>Phải trả</Text>
          <Text style={[styles.amountValue, { color: colors.redDeep }]}>
            -{formatCompactVND(summary.totalPayable)}
          </Text>
        </View>
      </View>

      {/* View details button */}
      <GameButton
        label='View details'
        variant='gem'
        size='sm'
        icon='chevron-right'
        fullWidth
        onPress={onPress}
      />
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
  emptyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  alertRow: {
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  alertText: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  amountCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  amountIconWrap: {
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  amountIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
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
});
