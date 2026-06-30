import { StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import type { LoggedExercise } from '@/store/gymStore';

interface LoggedExerciseCardProps {
  exercise: LoggedExercise;
}

/** A completed exercise: teal check, name, optional PR badge, set chips. */
export function LoggedExerciseCard({ exercise }: LoggedExerciseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={styles.checkCircle}>
            <Icon name="check" size={13} color={colors.screenBg} />
          </View>
          <Text style={styles.name}>{exercise.name}</Text>
          {exercise.pr ? (
            <View style={styles.prBadge}>
              <Icon name="trophy" size={11} color={colors.orange} />
              <Text style={styles.prText}>PR</Text>
            </View>
          ) : null}
        </View>
        <Icon name="dots-vertical" size={16} color={colors.tabInactive} />
      </View>

      <View style={styles.setsRow}>
        {exercise.sets.map((set, index) => (
          <View key={index} style={styles.setChip}>
            <Text style={styles.setWeight}>{set.weight}</Text>
            <Text style={styles.setReps}>{set.reps}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: tint(colors.orange),
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  prText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
    color: colors.orange,
  },
  setsRow: {
    flexDirection: 'row',
    gap: 7,
  },
  setChip: {
    flex: 1,
    backgroundColor: colors.track,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setWeight: {
    fontFamily: fonts.monoSemibold,
    fontSize: 14,
    color: colors.text,
  },
  setReps: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
});
