import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useGoalStore } from '@/store/goalStore';

export function GoalsWidget() {
  const router = useRouter();
  const ready = useGoalStore((s) => s.ready);

  if (!ready) return null;

  const goals = useGoalStore.getState().goals;
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const totalMilestones = activeGoals.reduce((s, g) => s + g.milestones.length, 0);
  const doneMilestones = activeGoals.reduce(
    (s, g) => s + g.milestones.filter((m) => m.done).length,
    0
  );
  const milestonePct = totalMilestones > 0
    ? Math.round((doneMilestones / totalMilestones) * 100)
    : 0;

  return (
    <WidgetCard
      domain='goals'
      title='Mục tiêu'
      icon='trophy-outline'
      onPress={() => router.push('/goals')}
    >
      <View style={styles.headerRow}>
        <Text style={styles.count}>{activeGoals.length}</Text>
        <Text style={styles.countLabel}>đang thực hiện</Text>
      </View>

      {activeGoals.length > 0 && (
        <>
          {/* Top goal */}
          <View style={styles.topGoal}>
            <Text style={styles.topGoalTitle} numberOfLines={1}>
              {activeGoals[0].title}
            </Text>
            <Text style={styles.topGoalMeta}>
              {activeGoals[0].milestones.filter((m) => m.done).length}/
              {activeGoals[0].milestones.length} mốc
            </Text>
          </View>

          {/* Overall milestone bar */}
          {totalMilestones > 0 && (
            <View style={styles.milestoneSection}>
              <View style={styles.milestoneRow}>
                <Text style={styles.milestoneLabel}>
                  {formatMilestoneText(doneMilestones, totalMilestones)}
                </Text>
                <Text style={styles.milestonePct}>{milestonePct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${milestonePct}%`,
                      backgroundColor: colors.green,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </>
      )}

      {completedGoals.length > 0 && (
        <Text style={styles.completedText}>
          <Icon name='check-circle' size={10} color={colors.green} />{' '}
          {completedGoals.length} hoàn thành
        </Text>
      )}

      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <Text style={styles.empty}>Chưa có mục tiêu</Text>
      )}
    </WidgetCard>
  );
}

function formatMilestoneText(done: number, total: number): string {
  if (total === 0) return 'Chưa có mốc';
  return `${done}/${total} mốc hoàn thành`;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 24,
    color: colors.green,
  },
  countLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  topGoal: {
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    padding: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border + '40',
    marginBottom: 8,
  },
  topGoalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
  },
  topGoalMeta: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  milestoneSection: {
    marginBottom: 6,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  milestonePct: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.green,
  },
  progressTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  completedText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: colors.green,
  },
  empty: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
