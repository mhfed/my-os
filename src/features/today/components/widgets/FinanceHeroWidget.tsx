import React, { memo } from "react";
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AnimatedCard, PressableScale } from '@/components/motion';
import { GamePanel } from '@/components/game';
import { colors, gradients, radius, base3D } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useFinanceStore } from '@/store/financeStore';
import { useSavingsStore } from '@/store/savingsStore';
import { useDebtStore } from '@/store/debtStore';
import { formatCompactVND } from '@/utils/currency';

export const FinanceHeroWidget = memo(function FinanceHeroWidget() {
  const router = useRouter();
  const financeReady = useFinanceStore((s) => s.ready);
  const savingsReady = useSavingsStore((s) => s.ready);
  const debtReady = useDebtStore((s) => s.ready);

  if (!financeReady || !savingsReady || !debtReady) return null;

  const overview = useFinanceStore.getState().getOverview();
  const recentTxns = useFinanceStore.getState().getTransactionViews(3);
  const activeGoals = useSavingsStore.getState().getActiveGoals();
  const debtSummary = useDebtStore.getState().getSummary();

  const pct = Math.min(100, Math.round(overview.budgetUsed * 100));
  const barColor =
    pct > 100 ? colors.red : pct > 80 ? colors.orange : colors.teal;
  const barGradient =
    pct > 100 ? gradients.red : pct > 80 ? gradients.gold : gradients.gem;

  const savingsTotal = activeGoals.reduce((s, g) => s + g.currentAmount, 0);
  const savingsTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0);
  const savingsPct =
    savingsTarget > 0
      ? Math.round((savingsTotal / savingsTarget) * 100)
      : 0;

  const netWorth = overview.saved - (debtSummary.totalPayable - debtSummary.totalReceivable);

  return (
    <AnimatedCard index={0}>
      <PressableScale onPress={() => router.push('/finance')} scaleTo={0.98} haptic='light'>
        <GamePanel style={styles.panel} flush>
          {/* Background gradient accent bar */}
          <LinearGradient
            colors={gradients.gem}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={gradients.gem}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={styles.iconBadge}
              >
                <Icon name='wallet' size={20} color={colors.white} />
              </LinearGradient>
              <View>
                <Text style={styles.headerTitle}>Tài chính</Text>
                <Text style={styles.headerSub}>Tháng {overview.month.slice(5)}</Text>
              </View>
            </View>
            <View style={styles.netWorthBadge}>
              <Text style={styles.netWorthLabel}>Tổng tài sản</Text>
              <Text style={[
                styles.netWorthValue,
                { color: netWorth >= 0 ? colors.teal : colors.red }
              ]}>
                {formatCompactVND(netWorth)}
              </Text>
            </View>
          </View>

          {/* Main spend display */}
          <View style={styles.spendArea}>
            <Text style={styles.spentLabel}>Đã chi</Text>
            <Text style={styles.spentAmount}>{formatCompactVND(overview.spent)}</Text>

            {/* Budget bar */}
            {overview.budget > 0 && (
              <View style={styles.budgetSection}>
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetText}>
                    Ngân sách {formatCompactVND(overview.budget)}
                  </Text>
                  <Text style={[styles.budgetPct, { color: barColor }]}>
                    {pct}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={barGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Income/Savings row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <View style={[styles.statDot, { backgroundColor: colors.teal }]} />
              <View>
                <Text style={styles.statValue}>{formatCompactVND(overview.income)}</Text>
                <Text style={styles.statLabel}>Thu nhập</Text>
              </View>
            </View>
            <View style={styles.stat}>
              <View style={[styles.statDot, { backgroundColor: colors.purple }]} />
              <View>
                <Text style={styles.statValue}>{formatCompactVND(overview.saved)}</Text>
                <Text style={styles.statLabel}>Tiết kiệm</Text>
              </View>
            </View>
            <View style={styles.stat}>
              <View style={[styles.statDot, { backgroundColor: colors.green }]} />
              <View>
                <Text style={styles.statValue}>{formatCompactVND(savingsTotal)}</Text>
                <Text style={styles.statLabel}>Mục tiêu</Text>
              </View>
            </View>
          </View>

          {/* Debt / Savings chips */}
          {(debtSummary.totalReceivable > 0 || debtSummary.totalPayable > 0) && (
            <View style={styles.debtRow}>
              {debtSummary.totalReceivable > 0 && (
                <View style={[styles.chip, styles.chipGreen]}>
                  <Icon name='arrow-bottom-left' size={12} color={colors.green} />
                  <Text style={styles.chipGreenText}>
                    Cho vay {formatCompactVND(debtSummary.totalReceivable)}
                  </Text>
                </View>
              )}
              {debtSummary.totalPayable > 0 && (
                <View style={[styles.chip, styles.chipRed]}>
                  <Icon name='arrow-top-right' size={12} color={colors.red} />
                  <Text style={styles.chipRedText}>
                    Nợ {formatCompactVND(debtSummary.totalPayable)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Recent transactions */}
          {recentTxns.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Giao dịch gần đây</Text>
              {recentTxns.map((txn) => (
                <View key={txn.id} style={styles.txnRow}>
                  <View style={[styles.txnIcon, { backgroundColor: txn.color + '20' }]}>
                    <Icon name={txn.icon as any} size={14} color={txn.color} />
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnName} numberOfLines={1}>{txn.name}</Text>
                    <Text style={styles.txnCat}>{txn.categoryName}</Text>
                  </View>
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
        </GamePanel>
      </PressableScale>
    </AnimatedCard>
  );
});

const styles = StyleSheet.create({
  panel: {
    paddingTop: 0,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    ...base3D(colors.tealDeep, 3),
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.text,
    ...textShadow.emboss,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: -1,
  },
  netWorthBadge: {
    alignItems: 'flex-end',
  },
  netWorthLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  netWorthValue: {
    fontFamily: fonts.displayExtra,
    fontSize: 16,
  },
  spendArea: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  spentLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spentAmount: {
    fontFamily: fonts.displayExtra,
    fontSize: 36,
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  budgetSection: {
    marginTop: 14,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  budgetText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  budgetPct: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border + '60',
    marginHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: -1,
  },
  debtRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  chipGreen: {
    backgroundColor: colors.green + '14',
    borderWidth: 1,
    borderColor: colors.green + '30',
  },
  chipRed: {
    backgroundColor: colors.red + '14',
    borderWidth: 1,
    borderColor: colors.red + '30',
  },
  chipGreenText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: colors.green,
  },
  chipRedText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: colors.red,
  },
  recentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border + '60',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
  },
  recentTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txnIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnInfo: {
    flex: 1,
    gap: 1,
  },
  txnName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  txnCat: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  txnAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
  },
});
