import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useFinanceStore } from '@/store/financeStore';
import type { TransactionView } from '@/types/finance';

import { TransactionRow } from './TransactionRow';

interface RecentTransactionsProps {
  transactions: TransactionView[];
  onSeeAll: () => void;
}

export function RecentTransactions({ transactions, onSeeAll }: RecentTransactionsProps) {
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Recent</Text>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {transactions.map((txn) => (
          <TransactionRow
            key={txn.id}
            txn={txn}
            onDelete={() => deleteTransaction(txn.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  seeAll: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.purple,
  },
  list: {
    gap: 10,
  },
});
