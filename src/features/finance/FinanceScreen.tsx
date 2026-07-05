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
import { AnimatedCard } from '@/components/motion';
import { useFinanceStore } from '@/store/financeStore';
import { useDebtStore } from '@/store/debtStore';
import { useSavingsStore } from '@/store/savingsStore';
import { formatCompactVND, formatVND } from '@/utils/currency';
import { formatTxnDate } from '@/utils/date';

import { AddTransactionSheet } from './components/AddTransactionSheet';
import { DebtLedgerSheet } from './components/DebtLedgerSheet';
import { FinanceHero } from './components/FinanceHero';
import { TransactionHistorySheet } from './components/TransactionHistorySheet';

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

/** Section header badge — matches Tasks screen SectionHeader tone. */
function SectionBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: tint(color, '18'), borderColor: tint(color, '30') }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
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

  // Debt & Savings
  const debtEntries = useDebtStore((s) => s.entries);
  const debtPayments = useDebtStore((s) => s.payments);
  const savingsGoals = useSavingsStore((s) => s.goals);

  // Modals
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [debtOpen, setDebtOpen] = useState(false);

  if (!ready) {
    return <View style={styles.screen} />;
  }

  // ----- Derived values -----
  const overview = getOverview();
  const categoriesSpend = getCategorySpend();
  const recentTxnViews = getTransactionViews(RECENT_LIMIT);
  const trends6 = getMonthlyTrends(6);

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
    return savingsGoals
      .filter((g) => g.status === 'active')
      .sort((a, b) => b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount);
  }, [savingsGoals]);

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
        {/* ---- Header: Title + Subtitle ---- */}
        <AnimatedCard index={0} style={styles.headerWrap}>
          <GamePanel style={styles.headerPanel}>
            <View style={styles.header}>
              <Text style={styles.title}>Tài chính</Text>
              <Text style={styles.subtitle}>
                Thu {formatCompactVND(overview.income)} · Chi {formatCompactVND(overview.spent)} · Tiết kiệm {formatCompactVND(saved)}
              </Text>
            </View>
          </GamePanel>
        </AnimatedCard>

        {/* ---- Hero Balance ---- */}
        <View style={styles.heroWrap}>
          <FinanceHero
            totalBalance={totalBalance}
            income={overview.income}
            spent={overview.spent}
          />
        </View>

        {/* ---- Bento Row: Donut + Trend ---- */}
        <View style={styles.bentoRow}>
          {/* Category Donut */}
          <AnimatedCard index={1} style={styles.bentoCard}>
            <SectionBadge label="Phân bổ" color={colors.gold} />
            <View style={styles.donutLayout}>
              <View style={styles.donutWrap}>
                <Svg width={120} height={120} viewBox="0 0 36 36">
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
                  <Text style={styles.donutCenterText}>{shortMonth(activeMonth)}</Text>
                </View>
              </View>
              <View style={styles.donutLegend}>
                {donutData.map((d) => (
                  <View key={d.categoryId} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                    <Text style={styles.legendLabel} numberOfLines={1}>
                      {d.name}
                    </Text>
                    <Text style={styles.legendPct}>{Math.round(d.pct)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </AnimatedCard>

          {/* Trend Chart */}
          <AnimatedCard index={2} style={styles.bentoCard}>
            <SectionBadge label="Xu hướng" color={colors.teal} />
            <View style={styles.trendWrap}>
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
                  const isCurrent = d.month === activeMonth;
                  return (
                    <View key={d.month} style={styles.trendCol}>
                      <View style={styles.trendPair}>
                        <View
                          style={[
                            styles.trendBarInc,
                            { height: incH, opacity: isCurrent ? 1 : 0.45 },
                          ]}
                        />
                        <View
                          style={[
                            styles.trendBarExp,
                            { height: expH, opacity: isCurrent ? 1 : 0.45 },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.trendLabel,
                          isCurrent && styles.trendLabelActive,
                        ]}
                      >
                        {shortMonth(d.month)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </AnimatedCard>
        </View>

        {/* ---- Savings Goals ---- */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SectionBadge label="Mục tiêu tiết kiệm" color={colors.gold} />
              <Pressable
                onPress={() => setSheetOpen(true)}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>Thêm</Text>
                <Icon name="plus" size={14} color={colors.gold} />
              </Pressable>
            </View>
            <View style={styles.goalsList}>
              {activeGoals.slice(0, 2).map((goal, i) => {
                const pct = Math.min(1, goal.currentAmount / goal.targetAmount);
                return (
                  <AnimatedCard key={goal.id} index={i + 3}>
                    <View style={styles.goalCard}>
                      <View style={styles.goalTop}>
                        <View style={styles.goalNameRow}>
                          <Icon
                            name={goal.icon as any}
                            size={18}
                            color={goal.color}
                          />
                          <Text style={styles.goalName}>{goal.name}</Text>
                        </View>
                        <Text style={styles.goalPct}>{Math.round(pct * 100)}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.max(pct * 100, 2)}%`,
                              backgroundColor: goal.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.goalAmounts}>
                        {formatCompactVND(goal.currentAmount)} / {formatCompactVND(goal.targetAmount)}
                      </Text>
                    </View>
                  </AnimatedCard>
                );
              })}
            </View>
          </View>
        )}

        {/* ---- Debt Ledger ---- */}
        <View style={styles.section}>
          <SectionBadge label="Sổ nợ" color={colors.purple} />
          <View style={styles.debtGrid}>
            <Pressable
              style={[styles.debtCard, styles.debtCardLend]}
              onPress={() => setDebtOpen(true)}
            >
              <Text style={styles.debtLabel}>Ai nợ tôi</Text>
              <Text style={[styles.debtAmount, { color: colors.secondaryFixedDim }]}>
                {formatVND(totalLend)}
              </Text>
              <View style={styles.debtAvatars}>
                {lendEntries.slice(0, 3).map((e) => (
                  <View
                    key={e.id}
                    style={[
                      styles.debtAvatar,
                      { backgroundColor: avatarColor(e.party) },
                    ]}
                  >
                    <Text style={styles.debtAvatarText}>{initials(e.party)}</Text>
                  </View>
                ))}
                {lendEntries.length > 3 && (
                  <View style={[styles.debtAvatar, styles.debtAvatarMore]}>
                    <Text style={styles.debtAvatarText}>+{lendEntries.length - 3}</Text>
                  </View>
                )}
              </View>
            </Pressable>

            <Pressable
              style={[styles.debtCard, styles.debtCardBorrow]}
              onPress={() => setDebtOpen(true)}
            >
              <Text style={styles.debtLabel}>Tôi nợ ai</Text>
              <Text style={[styles.debtAmount, { color: colors.error }]}>
                {formatVND(totalBorrow)}
              </Text>
              <View style={styles.debtAvatars}>
                {borrowEntries.slice(0, 3).map((e) => (
                  <View
                    key={e.id}
                    style={[
                      styles.debtAvatar,
                      { backgroundColor: avatarColor(e.party) },
                    ]}
                  >
                    <Text style={styles.debtAvatarText}>{initials(e.party)}</Text>
                  </View>
                ))}
                {borrowEntries.length > 3 && (
                  <View style={[styles.debtAvatar, styles.debtAvatarMore]}>
                    <Text style={styles.debtAvatarText}>+{borrowEntries.length - 3}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>
        </View>

        {/* ---- Budget / Category Breakdown ---- */}
        {categoriesSpend.length > 0 && (
          <View style={styles.section}>
            <SectionBadge label="Danh mục chi tiêu" color={colors.teal} />
            <View style={styles.catBreakdownCard}>
              {categoriesSpend
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 4)
                .map((cat, i) => {
                  const barPct = Math.min(100, cat.pct);
                  return (
                    <View key={cat.categoryId} style={styles.catRow}>
                      <View style={styles.catIcon}>
                        <Icon
                          name={cat.icon as any}
                          size={16}
                          color={cat.color}
                        />
                      </View>
                      <View style={styles.catBody}>
                        <View style={styles.catTop}>
                          <Text style={styles.catName} numberOfLines={1}>
                            {cat.name}
                          </Text>
                          <Text style={styles.catAmount} numberOfLines={1}>
                            {formatCompactVND(cat.amount)}
                          </Text>
                          <Text style={styles.catPct}>{Math.round(barPct)}%</Text>
                        </View>
                        <View style={styles.catTrack}>
                          <View
                            style={[
                              styles.catFill,
                              {
                                width: `${Math.max(barPct, 3)}%`,
                                backgroundColor: cat.color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              {categoriesSpend.length > 4 && (
                <Pressable
                  style={styles.seeAllBtn}
                  onPress={() => setHistoryOpen(true)}
                >
                  <Text style={styles.seeAllBtnText}>
                    Xem tất cả {categoriesSpend.length} danh mục
                  </Text>
                  <Icon name="chevron-right" size={14} color={colors.gold} />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* ---- Recent Transactions ---- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionBadge label="Giao dịch gần đây" color={colors.gold} />
            <Pressable onPress={() => setHistoryOpen(true)}>
              <Text style={styles.seeAllBtnText}>Tất cả</Text>
            </Pressable>
          </View>

          {recentTxnViews.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-text-outline" size={28} color={colors.muted} />
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
              <Text style={styles.emptySubtext}>Nhấn + để ghi giao dịch đầu tiên</Text>
            </View>
          ) : (
            <View style={styles.txnList}>
              {recentTxnViews.map((txn, i) => {
                const isIncome = txn.type === 'income';
                const amountColor = isIncome ? colors.green : colors.text;
                const amountPrefix = isIncome ? '+ ' : '- ';
                return (
                  <AnimatedCard key={txn.id} index={i + 5}>
                    <View style={styles.txnRow}>
                      <View
                        style={[
                          styles.txnIconWrap,
                          { backgroundColor: tint(txn.color, '1A') },
                        ]}
                      >
                        <Icon
                          name={txn.icon as any}
                          size={20}
                          color={txn.color}
                        />
                      </View>
                      <View style={styles.txnMid}>
                        <Text style={styles.txnName} numberOfLines={1}>
                          {txn.name}
                        </Text>
                        <Text style={styles.txnDate}>{formatTxnDate(txn.date)}</Text>
                      </View>
                      <Text style={[styles.txnAmount, { color: amountColor }]}>
                        {amountPrefix}{formatVND(txn.amount)}
                      </Text>
                    </View>
                  </AnimatedCard>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ---- FAB ---- */}
      <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
        <LinearGradient
          colors={FAB_GRADIENT}
          start={{ x: 0.17, y: 0 }}
          end={{ x: 0.83, y: 1 }}
          style={styles.fabGradient}
        >
          <Icon name="plus" size={28} color={colors.white} />
        </LinearGradient>
      </Pressable>

      {/* ---- Modals / Sheets ---- */}
      <AddTransactionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
      <TransactionHistorySheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
      <DebtLedgerSheet
        visible={debtOpen}
        onClose={() => setDebtOpen(false)}
      />
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

  // ---- Header (matches Tasks screen pattern) ----
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerPanel: {
    paddingVertical: 2,
  },
  header: {
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },

  // ---- Hero wrapper ----
  heroWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  // ---- Section badge ----
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  badgeLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // ---- Section layout ----
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // ---- Bento Row (Donut + Trend) ----
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  bentoCard: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    padding: 16,
    gap: 16,
  },

  // --- Donut ---
  donutLayout: {
    alignItems: 'center',
    gap: 16,
  },
  donutWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.text,
  },
  donutLegend: {
    width: '100%',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  legendPct: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.text,
  },

  // --- Trend Chart ---
  trendWrap: {
    gap: 8,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  trendLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
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
    height: 100,
    paddingTop: 8,
  },
  trendCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  trendPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  trendBarInc: {
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    minHeight: 4,
  },
  trendBarExp: {
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
    minHeight: 4,
  },
  trendLabel: {
    fontFamily: fonts.display,
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  trendLabelActive: {
    color: colors.gold,
    fontFamily: fonts.displayBold,
  },

  // --- Savings Goals ---
  goalsList: {
    gap: 10,
  },
  goalCard: {
    borderRadius: radius.xl,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    padding: 16,
    gap: 10,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalName: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
  },
  goalPct: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  goalAmounts: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.gold,
  },

  // --- Debt ---
  debtGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  debtCard: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
  },
  debtCardLend: {
    borderLeftColor: colors.secondaryFixedDim,
  },
  debtCardBorrow: {
    borderLeftColor: colors.error,
  },
  debtLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    letterSpacing: 0.7,
    color: colors.onSurfaceVariant,
  },
  debtAmount: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    lineHeight: 28,
  },
  debtAvatars: {
    flexDirection: 'row',
    marginTop: 4,
  },
  debtAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  debtAvatarMore: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  debtAvatarText: {
    fontFamily: fonts.displayBold,
    fontSize: 9,
    color: colors.onPrimary,
  },

  // --- Category Breakdown ---
  catBreakdownCard: {
    borderRadius: radius.xl,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    padding: 16,
    gap: 14,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBody: {
    flex: 1,
    gap: 5,
  },
  catTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catName: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  catAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
    color: colors.text,
  },
  catPct: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.muted,
    minWidth: 28,
    textAlign: 'right',
  },
  catTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    borderRadius: 999,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  seeAllBtnText: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.gold,
  },

  // --- Transactions ---
  txnList: {
    gap: 8,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.xl,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
  },
  txnIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnMid: {
    flex: 1,
    gap: 2,
  },
  txnName: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  txnDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  txnAmount: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 6,
    borderRadius: radius.xl,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
  },
  emptyText: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.muted,
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 18,
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
