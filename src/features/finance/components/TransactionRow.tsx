import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { base3D, colors, elevation, radius } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { IconBadge } from '@/components/game';
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
  const amountColor = isIncome ? colors.green : colors.text;
  const amountText = isIncome
    ? formatSignedVND(txn.amount, 'income')
    : formatVND(txn.amount);

  const rowContent = (
    <PressableScale style={styles.row} onPress={onEdit} haptic='light'>
      <IconBadge icon={txn.icon as IconName} color={txn.color} size={40} iconSize={19} />

      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {txn.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {txn.categoryName} · {formatTxnDate(txn.date)}
        </Text>
      </View>

      <Text style={[styles.amount, { color: amountColor }]}>{amountText}</Text>
    </PressableScale>
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
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...elevation.card,
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
    borderRadius: radius.md,
    marginLeft: 8,
    ...base3D(colors.redDeep, 3),
  },
});
