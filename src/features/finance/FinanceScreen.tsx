import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G } from "react-native-svg";

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { GamePanel } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { useFinanceStore } from '@/store/financeStore';
import { useDebtStore } from '@/store/debtStore';
import { useSavingsStore } from '@/store/savingsStore';
import type { MonthlyOverview, WeeklyOverview, TransactionView } from '@/types/finance';
import { formatCompactVND, formatVND } from '@/utils/currency';
import { formatTxnDate, currentWeekKey, getWeekKey } from '@/utils/date';

import { AddTransactionSheet } from './components/AddTransactionSheet';
import { DebtLedgerSheet } from './components/DebtLedgerSheet';
import { FinanceSummaryHeader } from './components/FinanceSummaryHeader';
import { FinancePortfolio } from './components/FinancePortfolio';
import { TransactionHistorySheet } from './components/TransactionHistorySheet';
import { QuickPettyCashModal } from './components/QuickPettyCashModal';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { EditTransactionSheet } from './components/EditTransactionSheet';

const RECENT_LIMIT = 5;
const FAB_GRADIENT = [colors.gold, colors.goldDeep] as const;

// ---------------------------------------------------------------------------
// SVG Donut Chart
// ---------------------------------------------------------------------------
const DONUT_R = 16;
const DONUT_CX = 18;
const DONUT_CY = 18;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_R;

function DonutSegment({
  pct,
  offset,
  color,
}: {
  pct: number;
  offset: number;
  color: string;
}) {
  const dash = (pct / 100) * DONUT_CIRCUMFERENCE;
  const gap = DONUT_CIRCUMFERENCE - dash;
  return (
    <Circle
      cx={DONUT_CX}
      cy={DONUT_CY}
      r={DONUT_R}
      fill="none"
      stroke={color}
      strokeWidth={4}
      strokeDasharray={`${dash}, ${gap}`}
      strokeDashoffset={offset}
    />
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shortMonth(monthKey: string): string {
  const [, m] = monthKey.split('-');
  const names = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return names[parseInt(m, 10) - 1] ?? m;
}

/** Generate a color from a string for avatar placeholders */
function avatarColor(name: string): string {
  const palette = [colors.primaryContainer, colors.secondaryFixedDim, colors.tertiaryFixedDim, colors.gold];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}



// ===========================================================================
// Main Screen
// ===========================================================================

export function FinanceScreen() {
  const ready = useFinanceStore((s) => s.ready);
  const activeMonth = useFinanceStore((s) => s.activeMonth);

  // Finance data
  const transactions = useFinanceStore((s) => s.transactions);
  const getOverview = useFinanceStore((s) => s.getOverview);
  const getCategorySpend = useFinanceStore((s) => s.getCategorySpend);
  const getTransactionViews = useFinanceStore((s) => s.getTransactionViews);
  const getMonthlyTrends = useFinanceStore((s) => s.getMonthlyTrends);
  const stepMonth = useFinanceStore((s) => s.stepMonth);
  const exportCSV = useFinanceStore((s) => s.exportCSV);

  // Debt & Savings
  const debtEntries = useDebtStore((s) => s.entries);
  const debtPayments = useDebtStore((s) => s.payments);
  const savingsGoals = useSavingsStore((s) => s.goals);
  const savingsContributions = useSavingsStore((s) => s.contributions);

  // Modals
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [debtOpen, setDebtOpen] = useState(false);
  const [pettyCashOpen, setPettyCashOpen] = useState(false);
  const [categoryBreakdownOpen, setCategoryBreakdownOpen] = useState(false);
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [editingTxn, setEditingTxn] = useState<TransactionView | null>(null);

  const getWeeklyOverview = useFinanceStore((s) => s.getWeeklyOverview);
  const getWeeklyCategorySpend = useFinanceStore((s) => s.getWeeklyCategorySpend);
  const getWeeklyTrends = useFinanceStore((s) => s.getWeeklyTrends);
  const getDebtSummary = useDebtStore((s) => s.getSummary);

  if (!ready) {
    return <View style={styles.screen} />;
  }

  // ----- Derived values based on active period -----
  const currentWeek = currentWeekKey();
  const overview = period === 'monthly' ? getOverview() : getWeeklyOverview(currentWeek);
  const categoriesSpend = period === 'monthly' ? getCategorySpend() : getWeeklyCategorySpend(currentWeek);
  const trends6 = period === 'monthly' ? getMonthlyTrends(6) : getWeeklyTrends(6);
  const { overdueCount, upcomingCount } = getDebtSummary();

  // Tabbed Recent Transactions
  const [recentTab, setRecentTab] = useState<'today' | 'week' | 'month'>('today');

  const isToday = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    return d.getDate() === now.getDate() &&
           d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  };

  const isCurrentWeek = (timestamp: number) => {
    return getWeekKey(timestamp) === currentWeek;
  };

  const isCurrentMonth = (timestamp: number) => {
    const d = new Date(timestamp);
    const [yStr, mStr] = activeMonth.split('-');
    return d.getFullYear() === parseInt(yStr, 10) && (d.getMonth() + 1) === parseInt(mStr, 10);
  };

  const recentFilteredTxns = useMemo(() => {
    const allViews = getTransactionViews(9999);
    return allViews.filter((t) => {
      if (recentTab === 'today') return isToday(t.date);
      if (recentTab === 'week') return isCurrentWeek(t.date);
      return isCurrentMonth(t.date);
    });
  }, [transactions, recentTab, activeMonth, currentWeek, getTransactionViews]);

  const { recentTabExpense, recentTabIncome } = useMemo(() => {
    let spent = 0;
    let income = 0;
    for (const t of recentFilteredTxns) {
      if (t.type === 'expense') spent += t.amount;
      else income += t.amount;
    }
    return { recentTabExpense: spent, recentTabIncome: income };
  }, [recentFilteredTxns]);

  // Total net worth: sum all income minus all expense across all transactions
  const totalBalance = useMemo(() => {
    let total = 0;
    for (const t of transactions) {
      if (t.type === 'income') total += t.amount;
      else total -= t.amount;
    }
    return total;
  }, [transactions]);

  // Savings goals (active)
  const activeGoals = useMemo(() => {
    return useSavingsStore.getState().getActiveGoals();
  }, [savingsGoals, savingsContributions]);

  // Debt entries grouped by type
  const lendEntries = useMemo(
    () => debtEntries.filter((e) => e.type === 'lend' && e.status !== 'settled'),
    [debtEntries],
  );
  const borrowEntries = useMemo(
    () => debtEntries.filter((e) => e.type === 'borrow' && e.status !== 'settled'),
    [debtEntries],
  );

  const totalLend = useMemo(() => {
    let total = 0;
    for (const e of lendEntries) {
      const paid = debtPayments.filter((p) => p.debtId === e.id).reduce((s, p) => s + p.amount, 0);
      total += e.originalAmount - paid;
    }
    return total;
  }, [lendEntries, debtPayments]);

  const totalBorrow = useMemo(() => {
    let total = 0;
    for (const e of borrowEntries) {
      const paid = debtPayments.filter((p) => p.debtId === e.id).reduce((s, p) => s + p.amount, 0);
      total += e.originalAmount - paid;
    }
    return total;
  }, [borrowEntries, debtPayments]);

  // Donut: top 3 categories by spend
  const donutData = useMemo(() => {
    const sorted = [...categoriesSpend].sort((a, b) => b.amount - a.amount);
    const top = sorted.slice(0, 3);
    const totalPct = top.reduce((s, c) => s + c.pct, 0);
    if (totalPct < 100 && sorted.length > 3) {
      top.push({
        categoryId: '__other__',
        name: 'Khác',
        color: colors.outlineVariant,
        icon: 'dots-horizontal',
        amount: sorted.slice(3).reduce((s, c) => s + c.amount, 0),
        pct: 100 - totalPct,
        budget: 0,
        budgetUsed: 0,
      });
    }
    return top;
  }, [categoriesSpend]);

  // Trend chart: max value for scaling
  const trendMax = useMemo(
    () => Math.max(...trends6.map((d) => Math.max(d.income, d.spent)), 1),
    [trends6],
  );
  const trendBarH = 80;

  // Build donut offset dynamically
  let donutOffset = 0;
  const donutSegments = donutData.map((d) => {
    const seg = { ...d, offset: donutOffset };
    donutOffset -= (d.pct / 100) * DONUT_CIRCUMFERENCE;
    return seg;
  });

  const totalSavings = useMemo(() => {
    return activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  }, [activeGoals]);

  const netWorth = totalBalance + totalSavings + totalLend - totalBorrow;

  const saved = overview.income - overview.spent;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Screen-wide top glow */}
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Summary Header ---- */}
        <View style={styles.headerContainer}>
          <FinanceSummaryHeader
            netWorth={netWorth}
            totalBalance={totalBalance}
            totalSavings={totalSavings}
            totalReceivable={totalLend}
            totalPayable={totalBorrow}
            income={overview.income}
            spent={overview.spent}
            period={period}
            activeMonth={activeMonth}
            onPressBalance={() => {
              setHistoryFilter('all');
              setHistoryOpen(true);
            }}
            onPressIncome={() => {
              setHistoryFilter('income');
              setHistoryOpen(true);
            }}
            onPressExpense={() => {
              setHistoryFilter('expense');
              setHistoryOpen(true);
            }}
            onPrevMonth={() => stepMonth(-1)}
            onNextMonth={() => stepMonth(1)}
            onExportCSV={exportCSV}
          />
        </View>

        {/* ---- Period Selector (Weekly vs Monthly) ---- */}
        <View style={styles.periodSelectorContainer}>
          <View style={styles.periodSelectorInner}>
            <PressableScale
              onPress={() => setPeriod('monthly')}
              style={[styles.periodSelectorBtn, period === 'monthly' && styles.periodSelectorBtnActive]}
              haptic='light'
              scaleTo={0.96}
            >
              <Text style={[styles.periodSelectorText, period === 'monthly' && styles.periodSelectorTextActive]}>
                Báo cáo tháng
              </Text>
            </PressableScale>
            <PressableScale
              onPress={() => setPeriod('weekly')}
              style={[styles.periodSelectorBtn, period === 'weekly' && styles.periodSelectorBtnActive]}
              haptic='light'
              scaleTo={0.96}
            >
              <Text style={[styles.periodSelectorText, period === 'weekly' && styles.periodSelectorTextActive]}>
                Báo cáo tuần
              </Text>
            </PressableScale>
          </View>
        </View>

        {/* ---- Budget Overdraft Alert ---- */}
        {overview.budget > 0 && overview.spent > overview.budget && (
          <AnimatedCard index={0.6} style={styles.budgetAlertWrap}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: tint(colors.red, '11'),
              borderWidth: 1,
              borderColor: colors.redDeep,
              borderRadius: radius.xl,
              padding: 16,
            }}>
              <Icon name='alert-circle-outline' size={24} color={colors.red} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.red }}>
                  Vượt ngân sách {period === 'monthly' ? 'tháng' : 'tuần'}!
                </Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 }}>
                  Bạn đã tiêu <Text testID="money-display">{formatVND(overview.spent)}</Text> vượt mức <Text testID="money-display">{formatVND(overview.budget)}</Text> (+<Text testID="money-display">{formatVND(overview.spent - overview.budget)}</Text>).
                </Text>
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* ---- Analytics Panel (Donut + Trend Chart) ---- */}
        <View style={styles.section}>
          <AnimatedCard index={1} style={styles.analyticsPanel}>
            <View style={styles.analyticsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.analyticsDot, { backgroundColor: colors.gold }]} />
                <Text style={styles.analyticsTitle}>Báo cáo phân bổ & Xu hướng</Text>
              </View>
              <PressableScale
                onPress={() => setCategoryBreakdownOpen(true)}
                style={styles.analyticsDetailBtn}
                haptic='light'
              >
                <Text style={styles.analyticsDetailText}>Xem chi tiết</Text>
                <Icon name='chevron-right' size={12} color={colors.muted} />
              </PressableScale>
            </View>

            <View style={styles.analyticsContent}>
              {/* Donut Chart */}
              <PressableScale
                onPress={() => setCategoryBreakdownOpen(true)}
                style={styles.analyticsDonutWrap}
                haptic='light'
              >
                <View style={styles.donutLayout}>
                  <View style={styles.donutWrap}>
                    <Svg width={72} height={72} viewBox="0 0 36 36">
                      <G rotation={-90} originX={18} originY={18}>
                        {donutSegments.map((seg) => (
                          <DonutSegment
                            key={seg.categoryId}
                            pct={seg.pct}
                            offset={seg.offset}
                            color={seg.color}
                          />
                        ))}
                      </G>
                    </Svg>
                    <View style={styles.donutCenter}>
                      <Text style={styles.donutCenterText}>
                        {period === 'monthly' ? shortMonth(activeMonth) : `W${currentWeek.split('-W')[1]}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.donutLegendCompact}>
                    {donutData.map((d) => (
                      <View key={d.categoryId} style={styles.legendCompactItem}>
                        <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                        <Text style={styles.legendPctCompact}>{Math.round(d.pct)}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </PressableScale>

              <View style={styles.analyticsDivider} />

              {/* Trend Chart */}
              <View style={styles.analyticsTrendWrap}>
                {trends6.length > 0 && (
                  <View style={styles.trendLegend}>
                    <View style={styles.trendLegendItem}>
                      <View style={[styles.trendDot, { backgroundColor: colors.gold }]} />
                      <Text style={styles.trendLegendText}>Thu</Text>
                    </View>
                    <View style={styles.trendLegendItem}>
                      <View style={[styles.trendDot, { backgroundColor: colors.red }]} />
                      <Text style={styles.trendLegendText}>Chi</Text>
                    </View>
                  </View>
                )}
                <View style={styles.trendBars}>
                  {trends6.map((d) => {
                    const incH = Math.max(4, (d.income / trendMax) * trendBarH);
                    const expH = Math.max(4, (d.spent / trendMax) * trendBarH);
                    const itemKey = period === 'monthly' ? (d as MonthlyOverview).month : (d as WeeklyOverview).week;
                    const isCurrent = period === 'monthly' ? itemKey === activeMonth : itemKey === currentWeek;
                    const barLabel = period === 'monthly' ? shortMonth(itemKey) : `W${itemKey.split('-W')[1] || itemKey}`;
                    return (
                      <View key={itemKey} style={styles.trendCol}>
                        <View style={styles.trendPair}>
                          <View
                            style={[
                              styles.trendBarInc,
                              { height: incH, opacity: isCurrent ? 1 : 0.4 },
                            ]}
                          />
                          <View
                            style={[
                              styles.trendBarExp,
                              { height: expH, opacity: isCurrent ? 1 : 0.4 },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.trendLabel,
                            isCurrent && styles.trendLabelActive,
                          ]}
                        >
                          {barLabel}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </AnimatedCard>
        </View>

        {/* ---- Assets & Liabilities Portfolio ---- */}
        <View style={styles.section}>
          <FinancePortfolio
            activeGoals={activeGoals}
            totalLend={totalLend}
            totalBorrow={totalBorrow}
            lendCount={lendEntries.length}
            borrowCount={borrowEntries.length}
            onPressDebt={() => setDebtOpen(true)}
            overdueCount={overdueCount}
            upcomingCount={upcomingCount}
          />
        </View>

        {/* ---- Recent Transactions (Clean Bank-Statement List) ---- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.analyticsDot, { backgroundColor: colors.gold }]} />
              <Text style={styles.recentSectionTitle}>Nhật ký giao dịch</Text>
            </View>
            <PressableScale onPress={() => setHistoryOpen(true)} haptic='light' scaleTo={0.95}>
              <Text style={styles.seeAllBtnText}>Tất cả lịch sử</Text>
            </PressableScale>
          </View>

          {/* Sub-tabs for transaction scope */}
          <View style={styles.txTabsContainer}>
            {(['today', 'week', 'month'] as const).map((tab) => {
              const label = tab === 'today' ? 'Hôm nay' : tab === 'week' ? 'Tuần này' : 'Tháng này';
              const active = recentTab === tab;
              return (
                <PressableScale
                  key={tab}
                  onPress={() => setRecentTab(tab)}
                  style={[styles.txTabBtn, active && styles.txTabBtnActive]}
                  haptic='light'
                >
                  <Text style={[styles.txTabText, active && styles.txTabTextActive]}>{label}</Text>
                </PressableScale>
              );
            })}
          </View>

          {/* Total values right below the tabs */}
          <View style={styles.txSummaryBanner}>
            <Text style={styles.txSummaryLabel}>Tổng chi tiêu chu kỳ:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {recentTabIncome > 0 && (
                <Text testID="money-display" style={{ fontFamily: fonts.monoSemibold, fontSize: 12, color: colors.green }}>
                  +{formatVND(recentTabIncome)}
                </Text>
              )}
              {recentTabIncome > 0 && recentTabExpense > 0 && (
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.muted }}>|</Text>
              )}
              {recentTabExpense > 0 ? (
                <Text testID="money-display" style={{ fontFamily: fonts.monoSemibold, fontSize: 12, color: colors.red }}>
                  -{formatVND(recentTabExpense)}
                </Text>
              ) : recentTabIncome === 0 ? (
                <Text testID="money-display" style={{ fontFamily: fonts.monoSemibold, fontSize: 12, color: colors.muted }}>
                  0 ₫
                </Text>
              ) : null}
            </View>
          </View>

          {recentFilteredTxns.length === 0 ? (
            <View style={styles.emptyStatementState}>
              <Icon name="receipt-text-outline" size={20} color={colors.muted} />
              <Text style={styles.emptyStatementText}>Không có giao dịch phát sinh</Text>
              <Text style={styles.emptyStatementSubtext}>
                {recentTab === 'today' ? 'Chưa ghi nhận chi tiêu trong hôm nay.' : recentTab === 'week' ? 'Chưa ghi nhận chi tiêu trong tuần này.' : 'Chưa ghi nhận chi tiêu trong tháng này.'}
              </Text>
            </View>
          ) : (
            <View style={styles.statementContainer}>
              {recentFilteredTxns.slice(0, 5).map((txn, i) => {
                const isIncome = txn.type === 'income';
                const amountColor = isIncome ? colors.green : colors.red;
                const amountPrefix = isIncome ? '+' : '-';
                return (
                  <View key={txn.id}>
                    {i > 0 && <View style={styles.statementDivider} />}
                    <PressableScale
                      onPress={() => setEditingTxn(txn)}
                      haptic='light'
                      style={styles.statementRow}
                    >
                      <View
                        style={[
                          styles.statementIconWrap,
                          { backgroundColor: tint(txn.color, '10') },
                        ]}
                      >
                        <Icon
                          name={txn.icon as any}
                          size={16}
                          color={txn.color}
                        />
                      </View>
                      
                      <View style={styles.statementMid}>
                        <Text style={styles.statementName} numberOfLines={1}>
                          {txn.name}
                        </Text>
                        <Text style={styles.statementDate}>
                          {txn.categoryName} · {formatTxnDate(txn.date)}
                        </Text>
                      </View>

                      <Text testID="money-display" style={[styles.statementAmount, { color: amountColor }]}>
                        {amountPrefix}{formatVND(txn.amount)}
                      </Text>
                    </PressableScale>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ---- FAB ---- */}
      <PressableScale
        style={styles.fab}
        onPress={() => setPettyCashOpen(true)}
        onLongPress={() => setSheetOpen(true)}
        delayLongPress={300}
        scaleTo={0.93}
        haptic='medium'
      >
        <LinearGradient
          colors={FAB_GRADIENT}
          start={{ x: 0.17, y: 0 }}
          end={{ x: 0.83, y: 1 }}
          style={styles.fabGradient}
        >
          <Icon name="plus" size={28} color={colors.white} />
        </LinearGradient>
      </PressableScale>

      {/* ---- Modals / Sheets ---- */}
      <AddTransactionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
      <TransactionHistorySheet
        visible={historyOpen}
        onClose={() => {
          setHistoryOpen(false);
          setHistoryFilter('all');
        }}
        initialFilter={historyFilter}
      />
      <DebtLedgerSheet
        visible={debtOpen}
        onClose={() => setDebtOpen(false)}
      />
      <QuickPettyCashModal
        visible={pettyCashOpen}
        onClose={() => setPettyCashOpen(false)}
        onSwitchToDetailed={() => {
          setPettyCashOpen(false);
          setSheetOpen(true);
        }}
      />
      <CategoryBreakdown
        visible={categoryBreakdownOpen}
        onClose={() => setCategoryBreakdownOpen(false)}
        data={categoriesSpend}
        period={period}
        periodKey={period === 'monthly' ? activeMonth : currentWeek}
      />
      {editingTxn && (
        <EditTransactionSheet
          txn={editingTxn}
          onClose={() => setEditingTxn(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ===========================================================================
// Styles
// ===========================================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.tabClear,
  },

  // ---- Redesigned Premium Styles ----
  headerContainer: {
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  periodSelectorContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  periodSelectorInner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.pill,
    padding: 3,
  },
  periodSelectorBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  periodSelectorBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  periodSelectorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  periodSelectorTextActive: {
    color: colors.text,
    fontFamily: fonts.semibold,
  },
  budgetAlertWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },

  // ---- Section layout ----
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  // ---- Analytics Panel (Unified Donut + Trend) ----
  analyticsPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.lg,
    padding: 16,
    gap: 16,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analyticsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  analyticsTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
  },
  analyticsDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  analyticsDetailText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  analyticsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyticsDonutWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsDivider: {
    width: 1,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 8,
  },
  analyticsTrendWrap: {
    flex: 1.3,
    alignItems: 'center',
    gap: 6,
  },

  // --- Donut Chart ---
  donutLayout: {
    alignItems: 'center',
    gap: 8,
  },
  donutWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.text,
  },
  donutLegendCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  legendCompactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendPctCompact: {
    fontFamily: fonts.monoSemibold,
    fontSize: 9,
    color: colors.text,
  },

  // --- Trend Chart ---
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  trendLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendDot: {
    width: 5,
    height: 5,
    borderRadius: 1.5,
  },
  trendLegendText: {
    fontFamily: fonts.monoRegular,
    fontSize: 9,
    color: colors.muted,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 80,
    paddingTop: 4,
  },
  trendCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  trendPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
  },
  trendBarInc: {
    width: 5,
    borderRadius: 2,
    backgroundColor: colors.gold,
    minHeight: 4,
  },
  trendBarExp: {
    width: 5,
    borderRadius: 2,
    backgroundColor: colors.red,
    minHeight: 4,
  },
  trendLabel: {
    fontFamily: fonts.display,
    fontSize: 8,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  trendLabelActive: {
    color: colors.gold,
    fontFamily: fonts.displayBold,
  },

  // --- Recent Transactions ---
  recentSectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
  },
  seeAllBtnText: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.gold,
  },
  txTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.pill,
    padding: 2,
    gap: 2,
    marginVertical: 4,
  },
  txTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  txTabBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  txTabText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.muted,
  },
  txTabTextActive: {
    color: colors.gold,
  },
  txSummaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  txSummaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },

  // --- Statement List ---
  statementContainer: {
    paddingHorizontal: 4,
  },
  statementDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  statementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    gap: 12,
  },
  statementIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statementMid: {
    flex: 1,
    gap: 1,
  },
  statementName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  statementDate: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  statementAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
  },

  // --- Empty Statement State ---
  emptyStatementState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.lg,
  },
  emptyStatementText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.muted,
  },
  emptyStatementSubtext: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.tabClear,
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
