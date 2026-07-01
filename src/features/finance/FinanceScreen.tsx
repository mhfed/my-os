import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gradients, glow, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { AnimatedCard, PressableScale, ShimmerView } from '@/components/motion';
import { CurrencyChip, GameIconButton, GamePanel } from '@/components/game';
import { SkiaBackground } from '@/components/skia';
import { useFinanceStore } from '@/store/financeStore';
import { useDebtStore } from '@/store/debtStore';
import { useSavingsStore } from '@/store/savingsStore';
import { monthLabel } from '@/utils/date';
import { formatCompactVND } from '@/utils/currency';

import { AddTransactionSheet } from './components/AddTransactionSheet';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { DebtLedgerSheet } from './components/DebtLedgerSheet';
import { DebtSummaryWidget } from './components/DebtSummaryWidget';
import { FinanceHero } from './components/FinanceHero';
import { ManageRecurringModal } from './components/ManageRecurringModal';
import { MonthSelector } from './components/MonthSelector';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { NetWorthWidget } from './components/NetWorthWidget';
import { RecentTransactions } from './components/RecentTransactions';
import { SavingsGoalsSection } from './components/SavingsGoalsSection';
import { TransactionHistorySheet } from './components/TransactionHistorySheet';

const RECENT_LIMIT = 5;

/** Phase 2 Finance tracker screen — composes all Finance UI from the store. */
export function FinanceScreen() {
  const ready = useFinanceStore((s) => s.ready);
  const activeMonth = useFinanceStore((s) => s.activeMonth);
  const stepMonth = useFinanceStore((s) => s.stepMonth);
  const getOverview = useFinanceStore((s) => s.getOverview);
  const getCategorySpend = useFinanceStore((s) => s.getCategorySpend);
  const getTransactionViews = useFinanceStore((s) => s.getTransactionViews);
  const getMonthlyTrends = useFinanceStore((s) => s.getMonthlyTrends);
  const exportCSV = useFinanceStore((s) => s.exportCSV);

  // Debt & Savings for summary
  useDebtStore((s) => s.entries);
  useDebtStore((s) => s.payments);
  const getDebtSummary = useDebtStore((s) => s.getSummary);
  const goals = useSavingsStore((s) => s.goals);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [debtOpen, setDebtOpen] = useState(false);

  if (!ready) {
    return <View style={styles.placeholder} />;
  }

  const overview = getOverview();
  const categories = getCategorySpend();
  const transactions = getTransactionViews(RECENT_LIMIT);
  const trends = getMonthlyTrends(6);
  const debtSummary = getDebtSummary();

  // Calculate total savings
  const totalSavings = goals
    .filter((g) => g.status === 'active')
    .reduce((sum, g) => sum + g.currentAmount, 0);

  // Level based on savings ratio (gamification)
  const savingsRatio =
    overview.income > 0 ? overview.saved / overview.income : 0;
  const level = Math.max(1, Math.min(10, Math.ceil(savingsRatio * 10) + 1));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SkiaBackground domain='finance' intensity={0.38} />
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      {/* HUD bar */}
      <AnimatedCard index={0} style={styles.hud}>
        <PressableScale onPress={() => {}} hitSlop={8} haptic='selection'>
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={gradients.gem}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarLetter}>₫</Text>
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          </View>
        </PressableScale>

        <View style={styles.hudResources}>
          <CurrencyChip kind='gems' value={formatCompactVND(overview.saved)} />
          <CurrencyChip kind='coins' value={formatCompactVND(totalSavings)} />
        </View>

        <GameIconButton
          icon='calendar-month'
          variant='gold'
          size={44}
          onPress={() => setRecurringOpen(true)}
        />
      </AnimatedCard>

      {/* Month selector */}
      <MonthSelector
        month={monthLabel(activeMonth)}
        onPrev={() => stepMonth(-1)}
        onNext={() => stepMonth(1)}
        onManageRecurring={() => setRecurringOpen(true)}
        onExportCSV={exportCSV}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero — budget dashboard */}
        <AnimatedCard index={1}>
          <FinanceHero
            budgetUsed={overview.budgetUsed}
            spent={overview.spent}
            saved={overview.saved}
            income={overview.income}
            budget={overview.budget}
            remaining={overview.remaining}
          />
        </AnimatedCard>

        {/* Net Worth */}
        <AnimatedCard index={2} style={styles.section}>
          <GamePanel title='Net Worth'>
            <NetWorthWidget />
          </GamePanel>
        </AnimatedCard>

        {/* Savings Goals */}
        <AnimatedCard index={3} style={styles.section}>
          <GamePanel
            title='Savings Goals'
            headerRight={
              <View style={styles.countChip}>
                <Text style={styles.countText}>
                  {goals.filter((g) => g.status === 'active').length}
                </Text>
              </View>
            }
            flush
          >
            <SavingsGoalsSection />
          </GamePanel>
        </AnimatedCard>

        {/* Debt Summary */}
        <AnimatedCard index={4} style={styles.section}>
          <GamePanel
            title='Debt Ledger'
            headerRight={
              <View style={styles.countChip}>
                <Text style={styles.countText}>
                  {debtSummary.totalPayable + debtSummary.totalReceivable > 0
                    ? '!'
                    : '✓'}
                </Text>
              </View>
            }
          >
            <DebtSummaryWidget onPress={() => setDebtOpen(true)} />
          </GamePanel>
        </AnimatedCard>

        {/* Monthly Trend */}
        <AnimatedCard index={5} style={styles.section}>
          <GamePanel title='Monthly Trend'>
            <MonthlyTrendChart data={trends} />
          </GamePanel>
        </AnimatedCard>

        {/* Category Breakdown */}
        <AnimatedCard index={6} style={styles.section}>
          <GamePanel
            title='Categories'
            headerRight={
              <View style={styles.countChip}>
                <Text style={styles.countText}>{categories.length}</Text>
              </View>
            }
          >
            <CategoryBreakdown data={categories} />
          </GamePanel>
        </AnimatedCard>

        {/* Recent Transactions */}
        <AnimatedCard index={7} style={styles.section}>
          <GamePanel
            title='Recent Transactions'
            headerRight={
              <PressableScale
                onPress={() => setHistoryOpen(true)}
                haptic='light'
              >
                <View style={styles.seeAllChip}>
                  <Text style={styles.seeAllText}>See all</Text>
                </View>
              </PressableScale>
            }
            flush
          >
            <RecentTransactions
              transactions={transactions}
              onSeeAll={() => setHistoryOpen(true)}
            />
          </GamePanel>
        </AnimatedCard>
      </ScrollView>

      {/* FAB */}
      <PressableScale
        style={styles.fab}
        onPress={() => setSheetOpen(true)}
        haptic='medium'
        accessibilityRole='button'
        accessibilityLabel='Add transaction'
      >
        <LinearGradient
          colors={gradients.gem}
          start={{ x: 0.17, y: 0 }}
          end={{ x: 0.83, y: 1 }}
          style={styles.fabGradient}
        >
          <Icon name='plus' size={28} color={colors.white} />
        </LinearGradient>
      </PressableScale>

      <AddTransactionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <ManageRecurringModal
        visible={recurringOpen}
        onClose={() => setRecurringOpen(false)}
      />

      <TransactionHistorySheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      <DebtLedgerSheet visible={debtOpen} onClose={() => setDebtOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    paddingTop: 4,
    paddingHorizontal: 18,
    paddingBottom: 120,
  },

  // --- HUD bar ---
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  avatarWrap: {
    width: 50,
    height: 50,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarLetter: {
    fontFamily: fonts.displayExtra,
    fontSize: 22,
    color: colors.white,
    ...textShadow.button,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    minWidth: 24,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontFamily: fonts.displayExtra,
    fontSize: 10,
    color: colors.text,
  },
  hudResources: {
    flexDirection: 'row',
    gap: 8,
  },

  // --- Sections ---
  section: {
    marginTop: 16,
  },
  countChip: {
    paddingHorizontal: 12,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
  },
  seeAllChip: {
    paddingHorizontal: 12,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllText: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.white,
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 18,
    shadowColor: colors.tealDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
