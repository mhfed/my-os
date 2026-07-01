import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { GameIconButton } from '@/components/game';
import { useFinanceStore } from '@/store/financeStore';
import type { TransactionView, TxnType } from '@/types/finance';
import { monthRange } from '@/utils/date';
import { formatTxnDate } from '@/utils/date';

import { EditTransactionSheet } from './EditTransactionSheet';
import { TransactionRow } from './TransactionRow';

interface TransactionHistorySheetProps {
  visible: boolean;
  onClose: () => void;
}

type Filter = 'all' | TxnType;

interface Group {
  dateLabel: string;
  txns: TransactionView[];
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'income', label: 'Thu' },
  { key: 'expense', label: 'Chi' },
];

export function TransactionHistorySheet({
  visible,
  onClose,
}: TransactionHistorySheetProps) {
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const activeMonth = useFinanceStore((s) => s.activeMonth);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editTxn, setEditTxn] = useState<TransactionView | null>(null);

  // Build TransactionView[] for active month — reactive to store changes
  const allViews = useMemo<TransactionView[]>(() => {
    const { start, end } = monthRange(activeMonth);
    const byId = new Map(categories.map((c) => [c.id, c]));
    return transactions
      .filter((t) => t.date >= start && t.date < end)
      .sort((a, b) => b.date - a.date)
      .map((t) => {
        const cat = byId.get(t.categoryId);
        const categoryName = cat?.name ?? 'Uncategorized';
        return {
          id: t.id,
          name: t.note || categoryName,
          categoryName,
          color: cat?.color ?? colors.muted,
          icon: cat?.icon ?? 'cash',
          amount: t.amount,
          type: t.type,
          date: t.date,
        };
      });
  }, [transactions, categories, activeMonth]);

  const filtered = useMemo<TransactionView[]>(() => {
    const q = search.trim().toLowerCase();
    return allViews.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (q) {
        return (
          t.name.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allViews, search, filter]);

  // Group filtered transactions by date label
  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, TransactionView[]>();
    for (const txn of filtered) {
      const label = formatTxnDate(txn.date);
      const arr = map.get(label) ?? [];
      arr.push(txn);
      map.set(label, arr);
    }
    return Array.from(map.entries()).map(([dateLabel, txns]) => ({
      dateLabel,
      txns,
    }));
  }, [filtered]);

  function handleClose() {
    setSearch('');
    setFilter('all');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={handleClose}
    >
      <EditTransactionSheet txn={editTxn} onClose={() => setEditTxn(null)} />
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lịch sử giao dịch</Text>
          <GameIconButton
            icon='close'
            variant='red'
            size={36}
            iconSize={16}
            onPress={handleClose}
          />
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Icon name='magnify' size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder='Tìm kiếm giao dịch...'
            placeholderTextColor={colors.tabInactive}
            returnKeyType='search'
            clearButtonMode='while-editing'
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <PressableScale
                key={f.key}
                onPress={() => setFilter(f.key)}
                haptic='selection'
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* Transaction count */}
        <Text style={styles.count}>{filtered.length} giao dịch</Text>

        {/* List */}
        <FlatList
          data={groups}
          keyExtractor={(item) => item.dateLabel}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name='receipt-text-outline' size={40} color={colors.tabInactive} />
              <Text style={styles.emptyText}>Không có giao dịch</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.group}>
              <Text style={styles.dateHeader}>{item.dateLabel}</Text>
              <View style={styles.groupRows}>
                {item.txns.map((txn) => (
                  <TransactionRow
                    key={txn.id}
                    txn={txn}
                    onDelete={() => deleteTransaction(txn.id)}
                    onEdit={() => setEditTxn(txn)}
                  />
                ))}
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    ...textShadow.emboss,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  filterRow: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.track,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purpleDeep,
  },
  filterChipText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.muted,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.tabInactive,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 4,
  },
  group: {
    marginBottom: 20,
  },
  dateHeader: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  groupRows: {
    gap: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.tabInactive,
  },
});
