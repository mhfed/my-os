import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import type { ActiveExercise } from '@/store/gymStore';

interface ActiveExerciseCardProps {
  exercise: ActiveExercise;
  onAddSet: () => void;
}

/** The in-progress exercise: gradient card, done set chips + next-set chip. */
export function ActiveExerciseCard({
  exercise,
  onAddSet,
}: ActiveExerciseCardProps) {
  return (
    <LinearGradient
      colors={['#1A1730', '#13131A']}
      start={{ x: 0.18, y: 0 }}
      end={{ x: 0.82, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={styles.circle} />
          <Text style={styles.name}>{exercise.name}</Text>
        </View>

        <View style={styles.restPill}>
          <Icon name="clock-outline" size={14} color={colors.orange} />
          <Text style={styles.restText}>{exercise.rest}</Text>
        </View>
      </View>

      <View style={styles.setsRow}>
        {exercise.sets.map((set, index) => (
          <View key={index} style={styles.doneChip}>
            <Text style={styles.doneWeight}>{set.weight}</Text>
            <Text style={styles.doneReps}>{set.reps}</Text>
          </View>
        ))}
        <View style={styles.nextChip}>
          <Text style={styles.nextText}>{exercise.nextSetLabel}</Text>
        </View>
      </View>

      <Pressable
        onPress={onAddSet}
        accessibilityRole="button"
        accessibilityLabel="Add set"
        style={styles.addSetButton}
      >
        <Icon name="plus" size={18} color={colors.screenBg} />
        <Text style={styles.addSetText}>Add set</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: colors.purple,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    // Subtle purple glow.
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.purple,
    backgroundColor: 'transparent',
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  restPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: tint(colors.orange),
    borderWidth: 1,
    borderColor: '#F5B16E40',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  restText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 14,
    color: colors.orange,
  },
  setsRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14,
  },
  doneChip: {
    flex: 1,
    backgroundColor: colors.track,
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneWeight: {
    fontFamily: fonts.monoSemibold,
    fontSize: 15,
    color: colors.text,
  },
  doneReps: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  nextChip: {
    flex: 1,
    backgroundColor: tint(colors.purple, '26'),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.purple,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
    color: '#B8B0FF',
  },
  addSetButton: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addSetText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.screenBg,
  },
});
