import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GamePanel, ProgressRing, StarRating } from '@/components/game';
import { PressableScale } from '@/components/motion';
import { colors, glass, gradients, glow, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts, typography } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { computeGoalProgress } from '@/store/goalStore';
import type { Goal } from '@/types/goal';
import type { Task } from '@/types/task';

const GOLD = colors.gold;
const DAY_MS = 86_400_000;

type Countdown = {
  label: string;
  color: string;
  bg: string;
  icon: 'flag-checkered' | 'clock-alert-outline' | 'alert-circle-outline';
};

/**
 * Deadline → a countdown pill. Neutral gold when comfortably ahead, orange when
 * the deadline is near (≤ 7 days) and red once overdue (DESIGN_SPEC §5.6).
 */
function computeCountdown(deadline: number): Countdown {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDeadline = new Date(deadline);
  startOfDeadline.setHours(0, 0, 0, 0);
  const days = Math.round(
    (startOfDeadline.getTime() - startOfToday.getTime()) / DAY_MS,
  );

  if (days < 0) {
    const overdue = Math.abs(days);
    return {
      label: `Quá hạn ${overdue} ngày`,
      color: colors.red,
      bg: tint(colors.red),
      icon: 'alert-circle-outline',
    };
  }
  if (days === 0) {
    return {
      label: 'Hạn hôm nay',
      color: colors.orange,
      bg: tint(colors.orange),
      icon: 'clock-alert-outline',
    };
  }
  if (days <= 7) {
    return {
      label: `Còn ${days} ngày`,
      color: colors.orange,
      bg: tint(colors.orange),
      icon: 'clock-alert-outline',
    };
  }
  return {
    label: `Còn ${days} ngày`,
    color: GOLD,
    bg: tint(GOLD),
    icon: 'flag-checkered',
  };
}

interface GoalCardProps {
  goal: Goal;
  onToggle: (milestoneId: string) => void;
  /** Standalone tasks linked to this goal via `task.goalId` (my-os-8u7). */
  linkedTasks?: Task[];
  /** Toggle a contributing task's done state (advances goal progress). */
  onToggleTask?: (taskId: string) => void;
  onEdit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
}

/**
 * A single goal: title, deadline countdown pill, a gold ProgressRing driven by
 * milestone completion AND linked-task completion (my-os-8u7), description, a
 * tappable milestone checklist and a "contributing tasks" section. At 100% it
 * blooms gold with a StarRating "victory" banner.
 */
export function GoalCard({
  goal,
  onToggle,
  linkedTasks = [],
  onToggleTask,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const { done, total, pct, remaining, complete, contributingTasks } =
    useMemo(() => {
      const p = computeGoalProgress(goal, linkedTasks);
      return { ...p, remaining: p.total - p.done };
    }, [goal, linkedTasks]);

  const countdown = goal.deadline ? computeCountdown(goal.deadline) : null;

  return (
    <GamePanel
      variant='glass'
      style={complete ? glow(GOLD, 0.35, 18) : undefined}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { flex: 1 }]} numberOfLines={2}>
              {goal.title}
            </Text>

            {onEdit || onDelete ? (
              <View style={styles.actionIcons}>
                {onEdit && (
                  <PressableScale
                    onPress={() => onEdit(goal.id)}
                    hitSlop={8}
                    style={styles.actionBtn}
                  >
                    <Icon name='pencil' size={18} color={colors.muted} />
                  </PressableScale>
                )}
                {onDelete && (
                  <PressableScale
                    onPress={() => onDelete(goal.id)}
                    hitSlop={8}
                    style={styles.actionBtn}
                  >
                    <Icon
                      name='trash-can-outline'
                      size={18}
                      color={colors.red}
                    />
                  </PressableScale>
                )}
              </View>
            ) : null}
          </View>
          {countdown ? (
            <View style={[styles.pill, { backgroundColor: countdown.bg }]}>
              <Icon name={countdown.icon} size={13} color={countdown.color} />
              <Text style={[styles.pillText, { color: countdown.color }]}>
                {countdown.label}
              </Text>
            </View>
          ) : null}
        </View>

        <ProgressRing
          progress={total > 0 ? done / total : 0}
          size={64}
          stroke={8}
          gradient={gradients.gold}
          glow={pct > 0}
        >
          <Text style={styles.ringValue}>{pct}%</Text>
        </ProgressRing>
      </View>

      {goal.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {goal.description}
        </Text>
      ) : null}

      {complete ? (
        <View style={styles.victory}>
          <StarRating filled={3} count={3} size={18} />
          <Text style={styles.victoryText}>Đã chinh phục! 🎉</Text>
        </View>
      ) : null}

      {goal.milestones.length > 0 ? (
        <View style={styles.milestones}>
          {goal.milestones.map((m) => (
            <PressableScale
              key={m.id}
              haptic='medium'
              scaleTo={0.97}
              onPress={() => onToggle(m.id)}
              style={styles.milestoneRow}
              accessibilityRole='checkbox'
              accessibilityState={{ checked: m.done }}
              accessibilityLabel={m.title}
            >
              <View style={[styles.checkbox, m.done && styles.checkboxDone]}>
                {m.done ? (
                  <Icon name='check-bold' size={13} color={colors.screenBg} />
                ) : null}
              </View>
              <Text
                style={[styles.milestoneText, m.done && styles.milestoneDone]}
                numberOfLines={2}
              >
                {m.title}
              </Text>
            </PressableScale>
          ))}
        </View>
      ) : null}

      {contributingTasks.length > 0 ? (
        <View style={styles.milestones}>
          <View style={styles.linkedHeader}>
            <Icon name='link-variant' size={13} color={colors.muted} />
            <Text style={styles.linkedHeaderText}>
              Task đóng góp ({contributingTasks.filter((t) => t.done).length}/
              {contributingTasks.length})
            </Text>
          </View>
          {contributingTasks.map((t) => (
            <PressableScale
              key={t.id}
              haptic='medium'
              scaleTo={0.97}
              onPress={() => onToggleTask?.(t.id)}
              style={styles.milestoneRow}
              accessibilityRole='checkbox'
              accessibilityState={{ checked: t.done }}
              accessibilityLabel={t.title}
            >
              <View style={[styles.checkbox, t.done && styles.checkboxDone]}>
                {t.done ? (
                  <Icon name='check-bold' size={13} color={colors.screenBg} />
                ) : null}
              </View>
              <Text
                style={[styles.milestoneText, t.done && styles.milestoneDone]}
                numberOfLines={2}
              >
                {t.title}
              </Text>
            </PressableScale>
          ))}
        </View>
      ) : null}

      <Text style={styles.footer}>
        {complete
          ? 'Tất cả cột mốc đã hoàn thành'
          : `${remaining} cột mốc còn lại`}
      </Text>
    </GamePanel>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 2,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors.text,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  pillText: {
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  ringValue: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.text,
  },
  description: {
    ...typography.bodyMd,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  victory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: tint(GOLD),
  },
  victoryText: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: GOLD,
  },
  milestones: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: glass.fillStrong,
    gap: 4,
  },
  linkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 2,
  },
  linkedHeaderText: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.muted,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  milestoneText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  milestoneDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  footer: {
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.muted,
    marginTop: spacing.sm,
  },
});
