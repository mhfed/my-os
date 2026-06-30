import { StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import type { TransactionView } from '@/types/finance';
import { formatSignedVND, formatVND } from '@/utils/currency';
import { formatTxnDate } from '@/utils/date';

interface TransactionRowProps {
  txn: TransactionView;
}

/** A single transaction row in the "Recent" list. */
export function TransactionRow({ txn }: TransactionRowProps) {
  const isIncome = txn.type === 'income';
  const amountColor = isIncome ? colors.teal : colors.text;
  const amountText = isIncome
    ? formatSignedVND(txn.amount, 'income')
    : formatVND(txn.amount);

  return (
    <View style={styles.row}>
      <View style={[styles.chip, { backgroundColor: tint(txn.color) }]}>
        <Icon name={txn.icon as IconName} size={19} color={txn.color} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {txn.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {txn.categoryName} · {formatTxnDate(txn.date)}
        </Text>
      </View>

      <Text style={[styles.amount, { color: amountColor }]}>{amountText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  chip: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  amount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 14,
  },
});
