import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useSavingsStore } from '@/store/savingsStore';
import { formatCompactVND } from '@/utils/currency';
import type { SavingsGoalView } from '@/types/savings';

import { AddGoalSheet } from './AddGoalSheet';
import { GoalDetailSheet } from './GoalDetailSheet';
import { SavingsGoalListSheet } from './SavingsGoalListSheet';

function GoalBar({ view, onPress }: { view: SavingsGoalView; onPress: () => void }) {
  const barColor =
    view.isOverdue ? colors.red
    : view.isAchieved ? colors.teal
    : view.color;

  return (
    <Pressable style={styles.goalRow} onPress={onPress}>
      <View style={[styles.goalIcon, { backgroundColor: tint(view.color, '22') }]}>
        <Icon name={view.icon as IconName} size={18} color={view.color} />
      </View>
      <View style={styles.goalMid}>
        <View style={styles.goalTopRow}>
          <Text style={styles.goalName} numberOfLines={1}>{view.name}</Text>
          <Text style={[styles.goalPct, { color: barColor }]}>
            {Math.round(view.progressPct * 100)}%
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${view.progressPct * 100}%`, backgroundColor: barColor }]} />
        </View>
        <View style={styles.goalBottomRow}>
          <Text style={styles.goalAmount}>{formatCompactVND(view.currentAmount)}</Text>
          <Text style={styles.goalTarget}>{formatCompactVND(view.targetAmount)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function SavingsGoalsSection() {
  // Subscribe to both state slices so Zustand triggers re-render on any change
  useSavingsStore((s) => s.goals);
  useSavingsStore((s) => s.contributions);
  const getActiveGoals = useSavingsStore((s) => s.getActiveGoals);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const goals = getActiveGoals();
  const preview = goals.slice(0, 3);

  return (
    <>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Tiết kiệm</Text>
          <View style={styles.headerActions}>
            {goals.length > 3 && (
              <Pressable onPress={() => setListOpen(true)}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </Pressable>
            )}
            <Pressable onPress={() => setAddOpen(true)} style={styles.addBtn}>
              <Icon name='plus' size={14} color={colors.purple} />
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          {preview.length === 0 ? (
            <Pressable style={styles.emptyRow} onPress={() => setAddOpen(true)}>
              <Icon name='piggy-bank' size={20} color={colors.muted} />
              <Text style={styles.emptyText}>Tạo mục tiêu tiết kiệm đầu tiên</Text>
              <Icon name='chevron-right' size={14} color={colors.tabInactive} />
            </Pressable>
          ) : (
            preview.map((g, i) => (
              <View key={g.id}>
                {i > 0 && <View style={styles.divider} />}
                <GoalBar view={g} onPress={() => setSelectedId(g.id)} />
              </View>
            ))
          )}
        </View>
      </View>

      <AddGoalSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <GoalDetailSheet goalId={selectedId} onClose={() => setSelectedId(null)} />
      <SavingsGoalListSheet visible={listOpen} onClose={() => setListOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seeAll: { fontFamily: fonts.medium, fontSize: 12, color: colors.purple },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: tint(colors.purple, '22'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    overflow: 'hidden',
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 18,
  },
  emptyText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  goalIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalMid: { flex: 1, gap: 5 },
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  goalName: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, flex: 1 },
  goalPct: { fontFamily: fonts.monoMedium, fontSize: 12 },
  track: { height: 5, backgroundColor: colors.track, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  goalBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalAmount: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.text },
  goalTarget: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
});
