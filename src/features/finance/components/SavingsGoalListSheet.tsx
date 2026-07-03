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
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, radius, elevation, base3D, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { GameIconButton } from '@/components/game';
import { PressableScale } from '@/components/motion';
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

/** Map a goal's stored accent color to its matching gradient (fallback purple). */
function gradientFor(barColor: string): readonly [string, string] {
  switch (barColor) {
    case colors.teal:
      return gradients.gold;
    case colors.red:
      return gradients.red;
    case colors.orange:
      return gradients.gold;
    case colors.green:
      return gradients.green;
    case colors.purple:
    default:
      return gradients.purple;
  }
}

function GoalRow({ view, onPress, index }: { view: SavingsGoalView; onPress: () => void; index: number }) {
  const barColor =
    view.status === 'achieved'
      ? colors.teal
      : view.isOverdue
      ? colors.red
      : view.color;
  const pct = Math.min(1, Math.max(0, view.progressPct));

  return (
    <PressableScale style={styles.row} onPress={onPress} haptic='light'>
      <View style={[styles.goalIconWrap, base3D(colors.purpleDeep, 2)]}>
        <View style={[styles.goalIcon, { backgroundColor: tint(view.color, '22') }]}>
          <Icon name={view.icon as IconName} size={18} color={view.color} />
        </View>
      </View>

      <View style={styles.rowMid}>
        <View style={styles.rowTop}>
          <Text style={styles.goalName} numberOfLines={1}>
            {view.name}
            {view.status === 'achieved' ? ' \u{1F389}' : ''}
          </Text>
          <Text style={[styles.pct, { color: barColor }]}>
            {Math.round(pct * 100)}%
          </Text>
        </View>
        <View style={styles.track}>
          <LinearGradient
            colors={gradientFor(barColor)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${pct * 100}%` }]}
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
    </PressableScale>
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
          <GameIconButton icon='close' variant='purple' size={36} iconSize={16} onPress={onClose} />
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
          renderItem={({ item, index }) => (
            <GoalRow view={item} index={index} onPress={() => setSelectedId(item.id)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <GameIconButton
          icon='plus'
          variant='purple'
          size={56}
          iconSize={26}
          style={styles.fab}
          onPress={() => setAddOpen(true)}
        />
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
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    ...textShadow.emboss,
  },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.track,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: tint(colors.purple, '22'), borderColor: colors.purple },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  chipTextActive: { color: colors.purple },
  list: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    padding: 14,
    ...elevation.card,
  },
  goalIconWrap: {
    borderRadius: radius.md,
  },
  goalIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowMid: { flex: 1, gap: 6 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  goalName: { fontFamily: fonts.display, fontSize: 14, color: colors.text, flex: 1 },
  pct: { fontFamily: fonts.monoSemibold, fontSize: 12 },
  track: { height: 10, backgroundColor: colors.track, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amounts: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  statusBadge: { fontFamily: fonts.semibold, fontSize: 11 },
  separator: { height: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: fonts.medium, fontSize: 14, color: colors.tabInactive },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 28,
  },
});
