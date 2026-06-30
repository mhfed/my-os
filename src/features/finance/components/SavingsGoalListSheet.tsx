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
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useSavingsStore } from '@/store/savingsStore';
import { formatCompactVND } from '@/utils/currency';
import type { SavingsGoalView } from '@/types/savings';

import { AddGoalSheet } from './AddGoalSheet';
import { GoalDetailSheet } from './GoalDetailSheet';

interface SavingsGoalListSheetProps {
  visible: boolean;
  onClose: () => void;
}

type StatusFilter = 'active' | 'achieved' | 'all';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'active', label: 'Đang tiết kiệm' },
  { key: 'achieved', label: 'Đã đạt' },
  { key: 'all', label: 'Tất cả' },
];

function GoalRow({ view, onPress }: { view: SavingsGoalView; onPress: () => void }) {
  const barColor =
    view.status === 'achieved'
      ? colors.teal
      : view.isOverdue
      ? colors.red
      : view.color;

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.goalIcon, { backgroundColor: tint(view.color, '22') }]}>
        <Icon name={view.icon as IconName} size={18} color={view.color} />
      </View>

      <View style={styles.rowMid}>
        <View style={styles.rowTop}>
          <Text style={styles.goalName} numberOfLines={1}>{view.name}</Text>
          <Text style={[styles.pct, { color: barColor }]}>
            {Math.round(view.progressPct * 100)}%
          </Text>
        </View>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${Math.min(1, view.progressPct) * 100}%`, backgroundColor: barColor }]}
          />
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.amounts}>
            {formatCompactVND(view.currentAmount)} / {formatCompactVND(view.targetAmount)}
          </Text>
          {view.status === 'achieved' ? (
            <Text style={[styles.statusBadge, { color: colors.teal }]}>✓ Đạt</Text>
          ) : view.isOverdue ? (
            <Text style={[styles.statusBadge, { color: colors.red }]}>Quá hạn</Text>
          ) : view.deadline ? (
            <Text style={[styles.statusBadge, { color: colors.muted }]}>
              {view.daysUntilDeadline !== null ? `${view.daysUntilDeadline} ngày` : ''}
            </Text>
          ) : null}
        </View>
      </View>

      <Icon name='chevron-right' size={15} color={colors.tabInactive} />
    </Pressable>
  );
}

export function SavingsGoalListSheet({ visible, onClose }: SavingsGoalListSheetProps) {
  const storeGoals = useSavingsStore((s) => s.goals);
  const getGoalView = useSavingsStore((s) => s.getGoalView);

  const [filter, setFilter] = useState<StatusFilter>('active');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const views = storeGoals
    .filter((g) => filter === 'all' || g.status === filter)
    .map((g) => getGoalView(g.id))
    .filter((v): v is SavingsGoalView => v !== null)
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      return b.progressPct - a.progressPct;
    });

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Mục tiêu tiết kiệm</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Icon name='close' size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, filter === f.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={views}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name='piggy-bank' size={36} color={colors.tabInactive} />
              <Text style={styles.emptyText}>Không có mục tiêu nào</Text>
            </View>
          }
          renderItem={({ item }) => (
            <GoalRow view={item} onPress={() => setSelectedId(item.id)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <Pressable style={styles.fab} onPress={() => setAddOpen(true)}>
          <Icon name='plus' size={24} color={colors.white} />
        </Pressable>
      </SafeAreaView>

      {/* Sub-sheets inside Modal so they appear on top of the pageSheet */}
      <AddGoalSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <GoalDetailSheet goalId={selectedId} onClose={() => setSelectedId(null)} />
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
  goalIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMid: { flex: 1, gap: 5 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  goalName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text, flex: 1 },
  pct: { fontFamily: fonts.monoMedium, fontSize: 12 },
  track: { height: 4, backgroundColor: colors.track, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amounts: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  statusBadge: { fontFamily: fonts.medium, fontSize: 11 },
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
