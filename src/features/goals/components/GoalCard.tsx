import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { ProgressRing, StarRating } from '@/components/game';
import { PressableScale } from '@/components/motion';
import { colors, glass, gradients, glow, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts, typography } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { computeGoalProgress } from '@/store/goalStore';
import { useSavingsStore } from '@/store/savingsStore';
import { useHabitsStore } from '@/store/habitsStore';
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
  linkedTasks?: Task[];
  onToggleTask?: (taskId: string) => void;
  onEdit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
}

export function GoalCard({
  goal,
  onToggle,
  linkedTasks = [],
  onToggleTask,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const savingsGoals = useSavingsStore((s) => s.goals);
  const habitLogs = useHabitsStore((s) => s.logs);

  const { done, total, pct, remaining, complete, contributingTasks } =
    useMemo(() => {
      const p = computeGoalProgress(goal, linkedTasks);
      return { ...p, remaining: p.total - p.done };
    }, [goal, linkedTasks, savingsGoals, habitLogs]);

  const countdown = goal.deadline ? computeCountdown(goal.deadline) : null;

  const savingsGoal = useMemo(() => {
    if (!goal.savingsGoalId) return null;
    return savingsGoals.find((g) => g.id === goal.savingsGoalId);
  }, [goal.savingsGoalId, savingsGoals]);

  const linkedHabit = useMemo(() => {
    if (!goal.habitId) return null;
    try {
      const { useHabitsStore } = require('@/store/habitsStore');
      return useHabitsStore.getState().views().find((h: any) => h.id === goal.habitId);
    } catch (e) {
      return null;
    }
  }, [goal.habitId, habitLogs]);

  return (
    <View style={[styles.card, complete ? glow(GOLD, 0.25, 20) : undefined]}>
      <BlurView intensity={12} tint='dark' style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents='none'
      />
      
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
          size={60}
          stroke={7}
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

      {/* Linked Modules Info */}
      {(savingsGoal || linkedHabit) && (
        <View style={styles.linksBlock}>
          {savingsGoal && (
            <View style={styles.linkRow}>
              <View style={styles.linkHeader}>
                <Icon name='piggy-bank-outline' size={14} color={colors.gold} />
                <Text style={styles.linkTitle} numberOfLines={1}>
                  Heo đất: {savingsGoal.name}
                </Text>
                <Text style={styles.linkVal}>
                  {Math.round(
                    (savingsGoal.targetAmount > 0
                      ? Math.min(1, savingsGoal.currentAmount / savingsGoal.targetAmount)
                      : 0) * 100
                  )}%
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.round(
                        (savingsGoal.targetAmount > 0
                          ? Math.min(1, savingsGoal.currentAmount / savingsGoal.targetAmount)
                          : 0) * 100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {linkedHabit && (
            <View style={[styles.linkRow, savingsGoal ? { marginTop: 8 } : undefined]}>
              <View style={styles.linkHeader}>
                <Icon name='repeat' size={14} color='#4ECDC4' />
                <Text style={styles.linkTitle} numberOfLines={1}>
                  Thói quen: {linkedHabit.name}
                </Text>
                <Text style={styles.linkVal}>
                  🔥 {linkedHabit.streak} ngày • {linkedHabit.pct}%
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

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
              <View style={[styles.checkbox, m.done ? styles.checkboxDone : styles.checkboxUndone]}>
                {m.done ? (
                  <Icon name='check-bold' size={13} color={colors.black} />
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
              Nhiệm vụ đóng góp ({contributingTasks.filter((t) => t.done).length}/
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
              <View style={[styles.checkbox, t.done ? styles.checkboxDone : styles.checkboxUndone]}>
                {t.done ? (
                  <Icon name='check-bold' size={13} color={colors.black} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
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
    gap: 12,
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
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pillText: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  ringValue: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
  },
  description: {
    ...typography.bodyMd,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  linksBlock: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  linkRow: {
    gap: 6,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkTitle: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.text,
  },
  linkVal: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.muted,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
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
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
    gap: 2,
  },
  linkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
    paddingTop: 6,
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
    minHeight: 40,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm - 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUndone: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  checkboxDone: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  milestoneText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  milestoneDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  footer: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.muted,
    marginTop: spacing.sm,
  },
});
