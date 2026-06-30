import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { colors, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import type { TransactionView } from '@/types/finance';
import { formatSignedVND, formatVND } from '@/utils/currency';
import { formatTxnDate } from '@/utils/date';

interface TransactionRowProps {
  txn: TransactionView;
  onDelete?: () => void;
  onEdit?: () => void;
}

function DeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.deleteAction} onPress={onPress}>
      <Icon name='delete-outline' size={20} color={colors.white} />
    </Pressable>
  );
}

export function TransactionRow({ txn, onDelete, onEdit }: TransactionRowProps) {
  const isIncome = txn.type === 'income';
  const amountColor = isIncome ? colors.teal : colors.text;
  const amountText = isIncome
    ? formatSignedVND(txn.amount, 'income')
    : formatVND(txn.amount);

  const rowContent = (
    <Pressable onPress={onEdit} style={styles.row}>
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
    </Pressable>
  );

  if (!onDelete) return rowContent;

  return (
    <Swipeable
      renderRightActions={() => <DeleteAction onPress={onDelete} />}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
    >
      {rowContent}
    </Swipeable>
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
  deleteAction: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,
    borderRadius: 14,
    marginLeft: 8,
  },
});
