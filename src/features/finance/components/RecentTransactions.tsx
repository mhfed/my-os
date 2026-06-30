import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import type { TransactionView } from '@/types/finance';

import { TransactionRow } from './TransactionRow';

interface RecentTransactionsProps {
  transactions: TransactionView[];
}

/** "Recent" header + the list of transaction rows. */
export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Recent</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>

      <View style={styles.list}>
        {transactions.map((txn) => (
          <TransactionRow key={txn.id} txn={txn} />
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
