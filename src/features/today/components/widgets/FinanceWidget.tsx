import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, gradients } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { WidgetCard } from '../WidgetCard';
import { useFinanceStore } from '@/store/financeStore';
import { useDebtStore } from '@/store/debtStore';
import { formatCompactVND } from '@/utils/currency';

export const FinanceWidget = memo(function FinanceWidget() {
  const router = useRouter();
  const ready = useFinanceStore((s) => s.ready);

  if (!ready) return null;

  const overview = useFinanceStore.getState().getOverview();
  const recentTxns = useFinanceStore.getState().getTransactionViews(2);
  const debtReady = useDebtStore.getState().ready;
  const debtSummary = debtReady ? useDebtStore.getState().getSummary() : null;

  const pct = Math.min(100, Math.round(overview.budgetUsed * 100));
  const barColor =
    pct > 100 ? colors.red : pct > 80 ? colors.orange : colors.teal;
  const barGradient =
    pct > 100 ? gradients.red : pct > 80 ? gradients.gold : gradients.gem;

  return (
    <WidgetCard
      domain='finance'
      title='Tài chính'
      icon='wallet'
      onPress={() => router.push('/finance')}
    >
      {/* Big spend */}
      <Text style={styles.spent}>{formatCompactVND(overview.spent)}</Text>
      <Text style={styles.budgetLabel}>
        Ngân sách {formatCompactVND(overview.budget)}
      </Text>

      {/* Gradient budget bar */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={barGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]}
        />
      </View>

      {/* Income / Saved */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.teal }]}>
            {formatCompactVND(overview.income)}
          </Text>
          <Text style={styles.statLabel}>Thu nhập</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.purple }]}>
            {formatCompactVND(overview.saved)}
          </Text>
          <Text style={styles.statLabel}>Tiết kiệm</Text>
        </View>
      </View>

      {/* Debt chips */}
      {debtSummary && (debtSummary.totalReceivable > 0 || debtSummary.totalPayable > 0) && (
        <View style={styles.debtRow}>
          {debtSummary.totalReceivable > 0 && (
            <View style={[styles.chip, { backgroundColor: colors.green + '14' }]}>
              <Text style={[styles.chipText, { color: colors.green }]}>
                Cho vay {formatCompactVND(debtSummary.totalReceivable)}
              </Text>
            </View>
          )}
          {debtSummary.totalPayable > 0 && (
            <View style={[styles.chip, { backgroundColor: colors.red + '14' }]}>
              <Text style={[styles.chipText, { color: colors.red }]}>
                Nợ {formatCompactVND(debtSummary.totalPayable)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Recent txn mini-list */}
      {recentTxns.length > 0 && (
        <View style={styles.txnList}>
          {recentTxns.map((txn) => (
            <View key={txn.id} style={styles.txnRow}>
              <Text style={styles.txnName} numberOfLines={1}>{txn.name}</Text>
              <Text style={[
                styles.txnAmount,
                { color: txn.type === 'income' ? colors.teal : colors.red }
              ]}>
                {txn.type === 'income' ? '+' : '−'}{formatCompactVND(txn.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </WidgetCard>
  );
});

const styles = StyleSheet.create({
  spent: {
    fontFamily: fonts.displayExtra,
    fontSize: 24,
    color: colors.teal,
  },
  budgetLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: -2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  stat: {
    gap: 1,
  },
  statValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  debtRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  chipText: {
    fontFamily: fonts.display,
    fontSize: 10,
  },
  txnList: {
    marginTop: 6,
    gap: 4,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnName: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
    flex: 1,
  },
  txnAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
  },
});
