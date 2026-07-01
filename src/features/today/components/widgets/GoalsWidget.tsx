import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { WidgetCard } from '../WidgetCard';
import { useGoalStore } from '@/store/goalStore';

export function GoalsWidget() {
  const router = useRouter();
  const ready = useGoalStore((s) => s.ready);

  if (!ready) return null;

  const goals = useGoalStore.getState().goals;
  const activeGoals = goals.filter((g) => g.status === 'active');
  const totalMilestones = activeGoals.reduce(
    (sum, g) => sum + g.milestones.length, 0
  );
  const doneMilestones = activeGoals.reduce(
    (sum, g) => sum + g.milestones.filter((m) => m.done).length, 0
  );

  return (
    <WidgetCard
      domain='goals'
      title='Goals'
      icon='bullseye'
      onPress={() => router.push('/goals')}
    >
      <Text style={styles.count}>
        {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
      </Text>
      {activeGoals.length > 0 && (
        <>
          <Text style={styles.goalPreview} numberOfLines={1}>
            {activeGoals[0].title}
          </Text>
          {totalMilestones > 0 && (
            <View style={styles.milestoneRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round((doneMilestones / totalMilestones) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.milestoneText}>
                {doneMilestones}/{totalMilestones}
              </Text>
            </View>
          )}
        </>
      )}
      {activeGoals.length === 0 && goals.length > 0 && (
        <Text style={styles.completed}>All goals completed! 🎉</Text>
      )}
      {goals.length === 0 && (
        <Text style={styles.empty}>No goals yet</Text>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 18,
    color: colors.green,
  },
  goalPreview: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  milestoneText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.muted,
  },
  completed: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.green,
  },
  empty: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
});
