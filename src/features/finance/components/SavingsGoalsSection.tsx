import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, radius, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts, textShadow } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { useSavingsStore } from '@/store/savingsStore';
import { formatCompactVND } from '@/utils/currency';
import type { SavingsGoalView } from '@/types/savings';

import { AddGoalSheet } from './AddGoalSheet';
import { GoalDetailSheet } from './GoalDetailSheet';
import { SavingsGoalListSheet } from './SavingsGoalListSheet';

/** Map a goal's stored accent color to its matching gradient + glow tint. */
function barGradientFor(barColor: string): readonly [string, string] {
  switch (barColor) {
    case colors.teal:
      return gradients.gem;
    case colors.red:
      return gradients.red;
    case colors.orange:
      return gradients.gold;
    case colors.purple:
      return gradients.purple;
    case colors.green:
      return gradients.green;
    default:
      return gradients.purple;
  }
}

function GoalBar({
  view,
  onPress,
}: {
  view: SavingsGoalView;
  onPress: () => void;
}) {
  const barColor = view.isOverdue
    ? colors.red
    : view.isAchieved
      ? colors.teal
      : view.color;
  const pct = Math.max(0, Math.min(1, view.progressPct));
  const barGradient = barGradientFor(barColor);

  return (
    <PressableScale style={styles.goalRow} onPress={onPress} haptic='light'>
      <View
        style={[styles.goalIcon, { backgroundColor: tint(view.color, '22') }]}
      >
        <Icon name={view.icon as IconName} size={18} color={view.color} />
      </View>
      <View style={styles.goalMid}>
        <View style={styles.goalTopRow}>
          <Text style={styles.goalName} numberOfLines={1}>
            {view.name}
            {view.isAchieved ? ' \u{1F389}' : ''}
          </Text>
          <Text style={[styles.goalPct, { color: barColor }]}>
            {Math.round(pct * 100)}%
          </Text>
        </View>
        <View style={styles.track}>
          <LinearGradient
            colors={barGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${pct * 100}%` }]}
          >
            <LinearGradient
              colors={gradients.gloss}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.fillGloss}
              pointerEvents='none'
            />
          </LinearGradient>
        </View>
        <View style={styles.goalBottomRow}>
          <Text style={styles.goalAmount}>
            {formatCompactVND(view.currentAmount)}
          </Text>
          <Text style={styles.goalTarget}>
            {formatCompactVND(view.targetAmount)}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

/** Savings goals list - designed to sit inside a GamePanel with flush=true */
export function SavingsGoalsSection() {
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
      {preview.length === 0 ? (
        <PressableScale
          style={styles.emptyRow}
          onPress={() => setAddOpen(true)}
          haptic='light'
        >
          <View style={styles.emptyIcon}>
            <Icon name='piggy-bank' size={20} color={colors.purple} />
          </View>
          <Text style={styles.emptyText}>Tạo mục tiêu tiết kiệm đầu tiên</Text>
          <Icon name='chevron-right' size={14} color={colors.tabInactive} />
        </PressableScale>
      ) : (
        <>
          {preview.map((g, i) => (
            <View key={g.id}>
              {i > 0 && <View style={styles.divider} />}
              <GoalBar view={g} onPress={() => setSelectedId(g.id)} />
            </View>
          ))}
          {goals.length > 3 && (
            <PressableScale
              style={styles.seeAllRow}
              onPress={() => setListOpen(true)}
              haptic='light'
            >
              <Text style={styles.seeAllText}>
                +{goals.length - 3} more goals
              </Text>
              <Icon name='chevron-right' size={14} color={colors.teal} />
            </PressableScale>
          )}
        </>
      )}

      <AddGoalSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <GoalDetailSheet
        goalId={selectedId}
        onClose={() => setSelectedId(null)}
      />
      <SavingsGoalListSheet
        visible={listOpen}
        onClose={() => setListOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
  },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tint(colors.purple, '1A'),
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  goalIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalMid: {
    flex: 1,
    gap: 6,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  goalName: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  goalPct: {
    fontFamily: fonts.monoSemibold,
    fontSize: 12,
  },
  track: {
    height: 12,
    backgroundColor: colors.track,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fillGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  goalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.text,
  },
  goalTarget: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
  },
  seeAllText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.teal,
  },
});
