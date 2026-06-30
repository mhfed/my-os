import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useDebtStore } from '@/store/debtStore';
import { formatCompactVND, formatVND } from '@/utils/currency';
import type { DebtType, DebtView } from '@/types/debt';

import { AddDebtSheet } from './AddDebtSheet';
import { DebtDetailSheet } from './DebtDetailSheet';

interface DebtLedgerSheetProps {
  visible: boolean;
  onClose: () => void;
}

type DebtFilter = 'open' | 'settled';

function DebtRow({ view, onPress }: { view: DebtView; onPress: () => void }) {
  const progressColor =
    view.status === 'settled'
      ? colors.teal
      : view.isOverdue
      ? colors.red
      : (view.daysUntilDue ?? Infinity) <= 7
      ? colors.orange
      : colors.purple;

  const statusLabel = view.status === 'settled'
    ? { text: 'Tất toán', color: colors.teal }
    : view.isOverdue
    ? { text: `Quá hạn ${Math.abs(view.daysUntilDue ?? 0)} ngày`, color: colors.red }
    : view.dueDate
    ? (view.daysUntilDue ?? Infinity) <= 7
      ? { text: `Còn ${view.daysUntilDue} ngày`, color: colors.orange }
      : (() => {
          const d = new Date(view.dueDate);
          return { text: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, color: colors.muted };
        })()
    : { text: view.status === 'partial' ? 'Một phần' : 'Đang mở', color: colors.muted };

  const pct = Math.min(1, view.progressPct);

  return (
    <Pressable style={styles.row} onPress={onPress}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: tint(progressColor, '22') }]}>
        <Text style={[styles.avatarText, { color: progressColor }]}>
          {view.party.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.rowMid}>
        <View style={styles.rowTop}>
          <Text style={styles.party} numberOfLines={1}>{view.party}</Text>
          <Text style={[styles.statusBadge, { color: statusLabel.color }]}>{statusLabel.text}</Text>
        </View>

        {/* Mini progress bar */}
        <View style={styles.miniTrack}>
          <View style={[styles.miniFill, { width: `${pct * 100}%`, backgroundColor: progressColor }]} />
        </View>

        <View style={styles.rowBottom}>
          <Text style={styles.paidText}>
            {formatCompactVND(view.paidAmount)} / {formatCompactVND(view.originalAmount)}
          </Text>
          <Text style={[styles.remainText, { color: progressColor }]}>
            {view.status === 'settled' ? '✓' : `còn ${formatCompactVND(view.totalOwed)}`}
          </Text>
        </View>
      </View>

      <Icon name='chevron-right' size={15} color={colors.tabInactive} />
    </Pressable>
  );
}

export function DebtLedgerSheet({ visible, onClose }: DebtLedgerSheetProps) {
  const entries = useDebtStore((s) => s.entries);
  const payments = useDebtStore((s) => s.payments);
  const getDebtView = useDebtStore((s) => s.getDebtView);
  const getSummary = useDebtStore((s) => s.getSummary);

  const [tab, setTab] = useState<DebtType>('lend');
  const [statusFilter, setStatusFilter] = useState<DebtFilter>('open');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const summary = getSummary();

  const views = entries
    .filter((e) => {
      if (e.type !== tab) return false;
      if (statusFilter === 'open') return e.status !== 'settled';
      return e.status === 'settled';
    })
    .map((e) => getDebtView(e.id)!)
    .filter(Boolean)
    .sort((a, b) => {
      // Sort: overdue → upcoming → open → partial
      if (a.status === 'settled' && b.status !== 'settled') return 1;
      if (b.status === 'settled' && a.status !== 'settled') return -1;
      if (a.isOverdue && !b.isOverdue) return -1;
      if (b.isOverdue && !a.isOverdue) return 1;
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      return b.createdAt - a.createdAt;
    });

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sổ nợ</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Icon name='close' size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Summary bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Thu về</Text>
            <Text style={[styles.summaryValue, { color: colors.teal }]}>
              +{formatCompactVND(summary.totalReceivable)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Phải trả</Text>
            <Text style={[styles.summaryValue, { color: colors.red }]}>
              -{formatCompactVND(summary.totalPayable)}
            </Text>
          </View>
          {(summary.overdueCount > 0 || summary.upcomingCount > 0) && (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Cảnh báo</Text>
                <Text style={[styles.summaryValue, { color: colors.orange, fontSize: 13 }]}>
                  {summary.overdueCount > 0
                    ? `${summary.overdueCount} quá hạn`
                    : `${summary.upcomingCount} sắp hạn`}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Tab: Lend / Borrow */}
        <View style={styles.tabs}>
          {(['lend', 'borrow'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            >
              <Icon
                name={t === 'lend' ? 'hand-coin' : 'bank-outline'}
                size={14}
                color={tab === t ? colors.purple : colors.muted}
              />
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'lend' ? 'Tôi cho vay' : 'Tôi đang nợ'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Status filter chips */}
        <View style={styles.filterRow}>
          {(['open', 'settled'] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setStatusFilter(f)}
              style={[styles.chip, statusFilter === f && styles.chipActive]}
            >
              <Text style={[styles.chipText, statusFilter === f && styles.chipTextActive]}>
                {f === 'open' ? 'Đang mở' : 'Đã tất toán'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={views}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name='handshake' size={36} color={colors.tabInactive} />
              <Text style={styles.emptyText}>
                {statusFilter === 'open' ? 'Không có khoản đang mở' : 'Không có khoản đã tất toán'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DebtRow view={item} onPress={() => setSelectedId(item.id)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* FAB */}
        <Pressable style={styles.fab} onPress={() => setAddOpen(true)}>
          <Icon name='plus' size={24} color={colors.white} />
        </Pressable>
      </SafeAreaView>

      {/* Sub-sheets must be inside the pageSheet Modal to appear on top of it */}
      <AddDebtSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <DebtDetailSheet debtId={selectedId} onClose={() => setSelectedId(null)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
  },
  summaryCol: { flex: 1, alignItems: 'center', gap: 3 },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  summaryValue: { fontFamily: fonts.monoSemibold, fontSize: 15 },
  summaryDivider: { width: 1, backgroundColor: colors.border },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: tint(colors.purple, '22') },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  tabTextActive: { color: colors.purple },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: tint(colors.purple, '2E'), borderColor: colors.purple },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  chipTextActive: { color: colors.purple },
  list: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.semibold, fontSize: 18 },
  rowMid: { flex: 1, gap: 6 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  party: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, flex: 1 },
  statusBadge: { fontFamily: fonts.medium, fontSize: 11 },
  miniTrack: { height: 4, backgroundColor: colors.track, borderRadius: 2, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 2 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  paidText: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  remainText: { fontFamily: fonts.monoMedium, fontSize: 11 },
  separator: { height: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.tabInactive },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
