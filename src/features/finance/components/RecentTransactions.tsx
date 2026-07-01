import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { AnimatedCard } from '@/components/motion';
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

  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name='receipt-text-outline' size={28} color={colors.muted} />
        <Text style={styles.emptyText}>Chưa có giao dịch nào ✨</Text>
        <Text style={styles.emptySubtext}>
          Nhấn nút + để ghi lại giao dịch đầu tiên
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {transactions.map((txn, i) => (
        <AnimatedCard key={txn.id} index={i}>
          <TransactionRow
            txn={txn}
            onDelete={() => deleteTransaction(txn.id)}
          />
        </AnimatedCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  emptyText: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
});
