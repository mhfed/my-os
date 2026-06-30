import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { SkiaBackground } from '@/components/skia';
import { useFinanceStore } from '@/store/financeStore';
import { monthLabel } from '@/utils/date';

import { AddTransactionSheet } from './components/AddTransactionSheet';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { DebtLedgerSheet } from './components/DebtLedgerSheet';
import { DebtSummaryWidget } from './components/DebtSummaryWidget';
import { ManageRecurringModal } from './components/ManageRecurringModal';
import { MonthSelector } from './components/MonthSelector';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { NetWorthWidget } from './components/NetWorthWidget';
import { RecentTransactions } from './components/RecentTransactions';
import { SavingsGoalsSection } from './components/SavingsGoalsSection';
import { SpendingOverview } from './components/SpendingOverview';
import { StatCards } from './components/StatCards';
import { TransactionHistorySheet } from './components/TransactionHistorySheet';

const RECENT_LIMIT = 6;

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

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SkiaBackground domain="finance" intensity={0.4} />
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
        <AnimatedCard index={0}>
          <SpendingOverview
            spent={overview.spent}
            budgetUsed={overview.budgetUsed}
            remaining={overview.remaining}
          />
        </AnimatedCard>
        <AnimatedCard index={1}>
          <StatCards
            income={overview.income}
            spent={overview.spent}
            saved={overview.saved}
          />
        </AnimatedCard>
        <AnimatedCard index={2}><NetWorthWidget /></AnimatedCard>
        <AnimatedCard index={3}><SavingsGoalsSection /></AnimatedCard>
        <AnimatedCard index={4}><DebtSummaryWidget onPress={() => setDebtOpen(true)} /></AnimatedCard>
        <AnimatedCard index={5}><MonthlyTrendChart data={trends} /></AnimatedCard>
        <AnimatedCard index={6}><CategoryBreakdown data={categories} /></AnimatedCard>
        <AnimatedCard index={7}>
          <RecentTransactions
            transactions={transactions}
            onSeeAll={() => setHistoryOpen(true)}
          />
        </AnimatedCard>
      </ScrollView>

      <PressableScale
        style={styles.fab}
        onPress={() => setSheetOpen(true)}
        haptic="medium"
        accessibilityRole='button'
        accessibilityLabel='Add transaction'
      >
        <LinearGradient
          colors={[colors.purple, '#5D52C9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.94, y: 0.34 }}
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

      <DebtLedgerSheet
        visible={debtOpen}
        onClose={() => setDebtOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 110,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 18,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
