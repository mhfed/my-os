import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useFinanceStore } from '@/store/financeStore';
import type { TransactionView } from '@/types/finance';

import { TransactionRow } from './TransactionRow';

interface RecentTransactionsProps {
  transactions: TransactionView[];
  onSeeAll: () => void;
}

/** Recent transactions list - designed to sit inside a GamePanel with flush=true */
export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  return (
    <View style={styles.list}>
      {transactions.map((txn) => (
        <TransactionRow
          key={txn.id}
          txn={txn}
          onDelete={() => deleteTransaction(txn.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 2,
  },
});
