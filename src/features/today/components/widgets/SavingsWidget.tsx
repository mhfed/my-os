import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useSavingsStore } from '@/store/savingsStore';
import { formatCompactVND } from '@/utils/currency';

export function SavingsWidget() {
  const router = useRouter();
  const ready = useSavingsStore((s) => s.ready);

  if (!ready) return null;

  const activeGoals = useSavingsStore.getState().getActiveGoals();
  const topGoals = activeGoals.slice(0, 3);

  const totalSaved = activeGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  if (activeGoals.length === 0) {
    return (
      <WidgetCard
        domain='goals'
        title='Tiết kiệm'
        icon='piggy-bank'
        onPress={() => router.push('/(tabs)/finance')}
      >
        <Text style={styles.noneText}>Chưa có mục tiêu</Text>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      domain='goals'
      title='Tiết kiệm'
      icon='piggy-bank'
      onPress={() => router.push('/(tabs)/finance')}
    >
      {activeGoals.length > 1 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>
            {formatCompactVND(totalSaved)} / {formatCompactVND(totalTarget)}
          </Text>
          <Text style={[styles.totalPct, { color: totalPct > 50 ? colors.green : colors.orange }]}>
            {totalPct}%
          </Text>
        </View>
      )}
      {topGoals.map((goal) => {
        const pct = Math.round(goal.progressPct * 100);
        return (
          <View key={goal.id} style={styles.goalRow}>
            <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
              <Icon name={goal.icon as any} size={14} color={goal.color} />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
              <View style={styles.goalBar}>
                <View
                  style={[
                    styles.goalFill,
                    { width: `${Math.min(pct, 100)}%`, backgroundColor: goal.color },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.goalAmount}>
              {formatCompactVND(goal.currentAmount)}
            </Text>
          </View>
        );
      })}
      {activeGoals.length > 3 && (
        <Text style={styles.moreText}>
          +{activeGoals.length - 3} mục tiêu khác
        </Text>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  noneText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  totalText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.muted,
  },
  totalPct: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  goalIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    gap: 4,
  },
  goalName: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.text,
  },
  goalBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 2,
  },
  goalAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    color: colors.text,
  },
  moreText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    textAlign: 'right',
    marginTop: 4,
  },
});
