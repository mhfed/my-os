import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { useFinanceStore } from '@/store/financeStore';
import { monthLabel } from '@/utils/date';

import { AddTransactionSheet } from './components/AddTransactionSheet';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { MonthSelector } from './components/MonthSelector';
import { RecentTransactions } from './components/RecentTransactions';
import { SpendingOverview } from './components/SpendingOverview';
import { StatCards } from './components/StatCards';

const RECENT_LIMIT = 6;

/** Phase 2 Finance tracker screen — composes all Finance UI from the store. */
export function FinanceScreen() {
  const ready = useFinanceStore((s) => s.ready);
  const activeMonth = useFinanceStore((s) => s.activeMonth);
  const stepMonth = useFinanceStore((s) => s.stepMonth);
  const getOverview = useFinanceStore((s) => s.getOverview);
  const getCategorySpend = useFinanceStore((s) => s.getCategorySpend);
  const getTransactionViews = useFinanceStore((s) => s.getTransactionViews);

  const [sheetOpen, setSheetOpen] = useState(false);

  if (!ready) {
    return <View style={styles.placeholder} />;
  }

  const overview = getOverview();
  const categories = getCategorySpend();
  const transactions = getTransactionViews(RECENT_LIMIT);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <MonthSelector
        month={monthLabel(activeMonth)}
        onPrev={() => stepMonth(-1)}
        onNext={() => stepMonth(1)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SpendingOverview
          spent={overview.spent}
          budgetUsed={overview.budgetUsed}
          remaining={overview.remaining}
        />
        <StatCards
          income={overview.income}
          spent={overview.spent}
          saved={overview.saved}
        />
        <CategoryBreakdown data={categories} />
        <RecentTransactions transactions={transactions} />
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
      >
        <LinearGradient
          colors={[colors.purple, '#5D52C9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.94, y: 0.34 }}
          style={styles.fabGradient}
        >
          <Icon name="plus" size={28} color={colors.white} />
        </LinearGradient>
      </Pressable>

      <AddTransactionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
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
