import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useGymStore } from '@/store/gymStore';

export function HealthWidget() {
  const router = useRouter();
  const ready = useGymStore((s) => s.ready);
  const isWorkoutActive = useGymStore((s) => s.isWorkoutActive);

  if (!ready) return null;

  const history = useGymStore.getState().history;
  const todayWorkouts = history.filter((w) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return w.startTime >= startOfDay;
  });
  const totalExercisesToday = todayWorkouts.reduce(
    (sum, w) => sum + w.exercises.length, 0
  );

  return (
    <WidgetCard
      domain='health'
      title='Health'
      icon='heart-pulse'
      onPress={() => router.push('/health')}
    >
      {isWorkoutActive ? (
        <View style={styles.activeRow}>
          <Icon name='dumbbell' size={16} color={colors.green} />
          <Text style={styles.activeText}>Workout in progress</Text>
        </View>
      ) : todayWorkouts.length > 0 ? (
        <>
          <Text style={styles.doneLabel}>Today's workout</Text>
          <Text style={styles.exerciseCount}>
            {totalExercisesToday} exercise{totalExercisesToday !== 1 ? 's' : ''} done
          </Text>
        </>
      ) : (
        <View style={styles.restRow}>
          <Icon name='bed' size={16} color={colors.muted} />
          <Text style={styles.restText}>Rest day</Text>
        </View>
      )}
      {history.length > 0 && (
        <Text style={styles.historyCount}>
          {history.length} past workout{history.length !== 1 ? 's' : ''}
        </Text>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.green,
  },
  doneLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  exerciseCount: {
    fontFamily: fonts.displayExtra,
    fontSize: 18,
    color: colors.red,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  historyCount: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
});
