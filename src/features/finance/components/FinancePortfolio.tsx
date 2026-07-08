import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { IconBadge } from '@/components/game';
import { formatCompactVND, formatVND } from '@/utils/currency';
import type { SavingsGoalView } from '@/types/savings';

import { AddGoalSheet } from './AddGoalSheet';
import { GoalDetailSheet } from './GoalDetailSheet';
import { SavingsGoalListSheet } from './SavingsGoalListSheet';

interface FinancePortfolioProps {
  activeGoals: SavingsGoalView[];
  totalLend: number;
  totalBorrow: number;
  lendCount: number;
  borrowCount: number;
  onPressDebt: () => void;
  overdueCount: number;
  upcomingCount: number;
}

export function FinancePortfolio({
  activeGoals,
  totalLend,
  totalBorrow,
  lendCount,
  borrowCount,
  onPressDebt,
  overdueCount,
  upcomingCount,
}: FinancePortfolioProps) {
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalListOpen, setGoalListOpen] = useState(false);

  const previewGoals = activeGoals.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* SECTION 1: DEBTS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sổ nợ & Các khoản vay</Text>
          <PressableScale onPress={onPressDebt} style={styles.actionBtn} haptic='light'>
            <Text style={styles.actionBtnText}>Chi tiết sổ</Text>
            <Icon name='chevron-right' size={14} color={colors.purple} />
          </PressableScale>
        </View>

        {/* Debt warning alert strip */}
        {(overdueCount > 0 || upcomingCount > 0) && (
          <View
            style={[
              styles.debtAlertRow,
              {
                backgroundColor: overdueCount > 0
                  ? tint(colors.red, '12')
                  : tint(colors.orange, '12'),
                borderColor: overdueCount > 0 ? tint(colors.red, '25') : tint(colors.orange, '25'),
              },
            ]}
          >
            <View style={[styles.alertDot, { backgroundColor: overdueCount > 0 ? colors.red : colors.orange }]} />
            <Text
              style={[
                styles.debtAlertText,
                { color: overdueCount > 0 ? colors.red : colors.orange },
              ]}
              numberOfLines={1}
            >
              {overdueCount > 0
                ? `${overdueCount} khoản quá hạn thanh toán`
                : `${upcomingCount} khoản đến hạn trong tuần này`}
            </Text>
          </View>
        )}

        <View style={styles.debtRow}>
          {/* Lend Block */}
          <PressableScale
            style={styles.debtBlock}
            onPress={onPressDebt}
            haptic='light'
          >
            <View style={styles.debtBlockHeader}>
              <View style={[styles.debtIconWrap, { backgroundColor: tint(colors.green, '10') }]}>
                <Icon name='arrow-top-right' size={12} color={colors.green} />
              </View>
              <Text style={styles.debtBlockLabel}>Cho mượn (Thu về)</Text>
            </View>
            <Text testID="money-display" style={[styles.debtAmount, { color: colors.green }]}>
              {formatVND(totalLend)}
            </Text>
            <Text style={styles.debtCount}>{lendCount} đối tác nợ</Text>
          </PressableScale>

          <View style={styles.verticalDivider} />

          {/* Borrow Block */}
          <PressableScale
            style={styles.debtBlock}
            onPress={onPressDebt}
            haptic='light'
          >
            <View style={styles.debtBlockHeader}>
              <View style={[styles.debtIconWrap, { backgroundColor: tint(colors.red, '10') }]}>
                <Icon name='arrow-bottom-left' size={12} color={colors.red} />
              </View>
              <Text style={styles.debtBlockLabel}>Đi vay (Cần trả)</Text>
            </View>
            <Text testID="money-display" style={[styles.debtAmount, { color: colors.red }]}>
              {formatVND(totalBorrow)}
            </Text>
            <Text style={styles.debtCount}>Nợ {borrowCount} đối tác</Text>
          </PressableScale>
        </View>
      </View>

      <View style={styles.horizontalDivider} />

      {/* SECTION 2: SAVINGS GOALS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mục tiêu tích kiệm</Text>
          <PressableScale onPress={() => setAddGoalOpen(true)} style={styles.actionBtn} haptic='light'>
            <Text style={styles.actionBtnText}>Thêm mục tiêu</Text>
            <Icon name='plus' size={14} color={colors.teal} />
          </PressableScale>
        </View>

        {previewGoals.length === 0 ? (
          <PressableScale
            style={styles.emptyGoalsRow}
            onPress={() => setAddGoalOpen(true)}
            haptic='light'
          >
            <Icon name='piggy-bank' size={20} color={colors.muted} />
            <Text style={styles.emptyText}>Chưa có mục tiêu. Nhấn để bắt đầu tích lũy.</Text>
          </PressableScale>
        ) : (
          <View style={styles.goalsList}>
            {previewGoals.map((goal) => {
              const pct = Math.min(1, goal.currentAmount / goal.targetAmount);
              return (
                <PressableScale
                  key={goal.id}
                  style={styles.goalRow}
                  onPress={() => setSelectedGoalId(goal.id)}
                  haptic='light'
                >
                  <IconBadge icon={goal.icon as IconName} color={goal.color} size={36} iconSize={18} />
                  <View style={styles.goalInfo}>
                    <View style={styles.goalTopRow}>
                      <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
                      <Text style={[styles.goalPct, { color: goal.color }]}>{Math.round(pct * 100)}%</Text>
                    </View>

                    {/* Minimal Progress Track */}
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: goal.color }]} />
                    </View>

                    <View style={styles.goalBottomRow}>
                      <Text style={styles.goalAmount}>
                        <Text testID="money-display">{formatCompactVND(goal.currentAmount)}</Text>
                      </Text>
                      <Text style={styles.goalTarget}>
                        mục tiêu <Text testID="money-display">{formatCompactVND(goal.targetAmount)}</Text>
                      </Text>
                    </View>
                  </View>
                </PressableScale>
              );
            })}

            {activeGoals.length > 3 && (
              <PressableScale
                style={styles.seeAllGoalsBtn}
                onPress={() => setGoalListOpen(true)}
                haptic='light'
              >
                <Text style={styles.seeAllText}>Xem tất cả {activeGoals.length} mục tiêu</Text>
                <Icon name='chevron-right' size={14} color={colors.muted} />
              </PressableScale>
            )}
          </View>
        )}
      </View>

      {/* Sheets / Modals */}
      <AddGoalSheet visible={addGoalOpen} onClose={() => setAddGoalOpen(false)} />
      <GoalDetailSheet goalId={selectedGoalId} onClose={() => setSelectedGoalId(null)} />
      <SavingsGoalListSheet visible={goalListOpen} onClose={() => setGoalListOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.xl,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 18,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: colors.text,
    letterSpacing: -0.2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  debtAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  debtAlertText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    flex: 1,
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debtBlock: {
    flex: 1,
    gap: 4,
  },
  debtBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  debtIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtBlockLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  debtAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 16,
    marginTop: 2,
  },
  debtCount: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  verticalDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginHorizontal: 16,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  emptyGoalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    flex: 1,
  },
  goalsList: {
    gap: 14,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalInfo: {
    flex: 1,
    gap: 4,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  goalName: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  goalPct: {
    fontFamily: fonts.monoSemibold,
    fontSize: 12,
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  goalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
    color: colors.text,
  },
  goalTarget: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  seeAllGoalsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    marginTop: 4,
  },
  seeAllText: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.muted,
  },
});
