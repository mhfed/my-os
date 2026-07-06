import { useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, glass, radius } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { GameIconButton, EmptyState } from '@/components/game';
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

/** Transaction history modal — full-screen searchable log. */
export function TransactionHistorySheet({
  visible,
  onClose,
}: TransactionHistorySheetProps) {
  const getTransactionViews = useFinanceStore((s) => s.getTransactionViews);
  const allTransactions = useFinanceStore((s) => s.transactions);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | TxnType>('all');
  const [editingTxn, setEditingTxn] = useState<TransactionView | null>(null);

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
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
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
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={filtered.length === 0 ? styles.emptyContent : styles.listContent}
          renderItem={({ item }) => (
            <PressableScale onPress={() => setEditingTxn(item)} haptic='light' style={styles.txnRow}>
              <TransactionRow txn={item} />
            </PressableScale>
          )}
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
        </SafeAreaView>
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
});
