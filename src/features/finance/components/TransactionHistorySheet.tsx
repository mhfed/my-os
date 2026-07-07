import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { GameIconButton, EmptyState } from '@/components/game';
import { useFinanceStore } from '@/store/financeStore';
import type { TransactionView, TxnType } from '@/types/finance';
import { monthRange } from '@/utils/date';
import { formatTxnDate } from '@/utils/date';
import { formatCompactVND } from '@/utils/currency';

import { EditTransactionSheet } from './EditTransactionSheet';
import { TransactionRow } from './TransactionRow';

interface TransactionHistorySheetProps {
  visible: boolean;
  onClose: () => void;
  /** Optional initial filter type — pre-selects 'income' or 'expense' tab on open. */
  initialFilter?: 'all' | TxnType;
}

interface DayGroup {
  dateLabel: string;
  totalExpense: number;
  totalIncome: number;
  items: TransactionView[];
}

function groupTransactionsByDay(txns: TransactionView[]): DayGroup[] {
  const groups: { [key: string]: DayGroup } = {};
  
  for (const t of txns) {
    const d = new Date(t.date);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        dateLabel: formatTxnDate(t.date),
        totalExpense: 0,
        totalIncome: 0,
        items: [],
      };
    }
    
    groups[dateKey].items.push(t);
    if (t.type === 'expense') {
      groups[dateKey].totalExpense += t.amount;
    } else {
      groups[dateKey].totalIncome += t.amount;
    }
  }
  
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => groups[key]);
}

/** Transaction history modal — full-screen searchable log. */
export function TransactionHistorySheet({
  visible,
  onClose,
  initialFilter,
}: TransactionHistorySheetProps) {
  const insets = useSafeAreaInsets();
  const getTransactionViews = useFinanceStore((s) => s.getTransactionViews);
  const allTransactions = useFinanceStore((s) => s.transactions);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TxnType>(initialFilter ?? 'all');
  const [editingTxn, setEditingTxn] = useState<TransactionView | null>(null);

  // Sync filter when initialFilter changes (e.g. opened from hero card)
  // Reset filter when sheet is closed
  const prevVisible = useRef(visible);
  if (visible && !prevVisible.current && initialFilter) {
    // Sheet just opened — apply the initial filter
    if (filterType !== initialFilter) setFilterType(initialFilter);
  }
  if (!visible && prevVisible.current) {
    // Sheet just closed — reset filter
    if (filterType !== 'all') setFilterType('all');
  }
  prevVisible.current = visible;

  const allTxns = useMemo(() => getTransactionViews(9999), [allTransactions, getTransactionViews]);

  const filtered = useMemo(() => {
    let list = allTxns;
    if (filterType !== 'all') {
      list = list.filter((t) => t.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.categoryName?.toLowerCase().includes(q) ||
          t.amount.toString().includes(q),
      );
    }
    return list;
  }, [allTxns, filterType, searchQuery]);

  const grouped = useMemo(() => {
    return groupTransactionsByDay(filtered);
  }, [filtered]);

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='fullScreen'
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.screen}
      >
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.04)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gloss}
          pointerEvents='none'
        />

        {/* Header */}
        <View style={styles.header}>
          <PressableScale
            onPress={onClose}
            haptic='light'
            hitSlop={10}
            style={styles.back}
            accessibilityRole='button'
            accessibilityLabel='Đóng'
          >
            <Icon name='close' size={24} color={colors.text} />
          </PressableScale>
          <Text style={styles.title}>Lịch sử giao dịch</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name='magnify' size={18} color={colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder='Tìm giao dịch...'
              placeholderTextColor={colors.tabInactive}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <PressableScale onPress={() => setSearchQuery('')} haptic='light' hitSlop={8}>
                <Icon name='close' size={18} color={colors.muted} />
              </PressableScale>
            ) : null}
          </View>
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {(['all', 'income', 'expense'] as const).map((type) => (
            <PressableScale
              key={type}
              onPress={() => setFilterType(type)}
              haptic='selection'
              style={[styles.filterChip, filterType === type && styles.filterChipActive]}
            >
              <Text style={[styles.filterLabel, filterType === type && styles.filterLabelActive]}>
                {type === 'all' ? 'Tất cả' : type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
              </Text>
            </PressableScale>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.dateLabel}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={grouped.length === 0 ? styles.emptyContent : styles.listContent}
          renderItem={({ item: group }) => {
            const isTodayOrYesterday = group.dateLabel === 'Today' || group.dateLabel === 'Yesterday';
            return (
              <View style={styles.groupContainer}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupDateWrap}>
                    <Icon
                      name='calendar-blank-outline'
                      size={14}
                      color={isTodayOrYesterday ? colors.gold : colors.muted}
                    />
                    <Text style={[styles.groupDate, isTodayOrYesterday && { color: colors.gold, fontFamily: fonts.semibold }]}>
                      {group.dateLabel}
                    </Text>
                  </View>
                  <View style={styles.groupTotalsWrap}>
                    {group.totalIncome > 0 && (
                      <View style={[styles.totalBadge, { backgroundColor: tint(colors.green, '1A'), borderColor: colors.green }]}>
                        <Text style={[styles.totalBadgeText, { color: colors.green }]}>
                          +{formatCompactVND(group.totalIncome)}
                        </Text>
                      </View>
                    )}
                    {group.totalExpense > 0 && (
                      <View style={[styles.totalBadge, { backgroundColor: tint(colors.red, '1A'), borderColor: colors.red }]}>
                        <Text style={[styles.totalBadgeText, { color: colors.red }]}>
                          -{formatCompactVND(group.totalExpense)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.groupItems}>
                  {group.items.map((txn, index) => (
                    <View key={txn.id}>
                      {index > 0 && <View style={styles.rowDivider} />}
                      <TransactionRow
                        txn={txn}
                        onEdit={() => setEditingTxn(txn)}
                        borderless
                      />
                    </View>
                  ))}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon='wallet-outline'
              title='Không có giao dịch'
              subtitle={searchQuery ? 'Thử tìm kiếm với từ khóa khác.' : 'Chưa có giao dịch nào trong tháng này.'}
            />
          }
        />

        {editingTxn && (
          <EditTransactionSheet
            txn={editingTxn}
            onClose={() => setEditingTxn(null)}
          />
        )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  gloss: { ...StyleSheet.absoluteFillObject },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  back: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  title: {
    fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 28, color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: glass.fill,
    borderWidth: 1, borderColor: glass.rim,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm, paddingVertical: 10, gap: 10,
  },
  searchInput: {
    flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text,
  },
  filterRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: glass.fill,
    borderWidth: 1, borderColor: glass.rim,
  },
  filterChipActive: {
    backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer,
  },
  filterLabel: {
    fontFamily: fonts.display, fontSize: 13, color: colors.muted,
  },
  filterLabelActive: {
    color: colors.onPrimaryContainer,
  },
  listContent: {
    paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.xxl,
  },
  emptyContent: {
    flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg,
  },
  txnRow: {
    paddingVertical: spacing.xs,
  },
  groupContainer: {
    marginBottom: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 4,
  },
  groupDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupDate: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  groupTotalsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalBadge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  totalBadgeText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
  },
  groupItems: {
    paddingHorizontal: 4,
    gap: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
});
