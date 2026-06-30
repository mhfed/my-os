import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import { useGymStore } from '@/store/gymStore';

import { WorkoutHeader } from './components/WorkoutHeader';
import { LoggedExerciseCard } from './components/LoggedExerciseCard';
import { ActiveExerciseCard } from './components/ActiveExerciseCard';
import { FinishBar } from './components/FinishBar';

const MUSCLE_GROUP = 'Chest & Triceps';

/** The active-workout (Gym Tracker) screen — Health tab content. */
export function GymScreen() {
  const router = useRouter();
  const logged = useGymStore((state) => state.logged);
  const active = useGymStore((state) => state.active);
  const addSet = useGymStore((state) => state.addSet);

  // "4 / 5 exercises" — logged + the active one, of a 5-exercise plan.
  const progressLabel = `${logged.length + 1} / 5 exercises`;

  const handleBack = () => router.navigate('/');
  const handleFinish = () => router.navigate('/');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <WorkoutHeader
        onBack={handleBack}
        muscleGroup={MUSCLE_GROUP}
        progressLabel={progressLabel}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {logged.map((exercise) => (
          <LoggedExerciseCard key={exercise.name} exercise={exercise} />
        ))}

        <ActiveExerciseCard exercise={active} onAddSet={addSet} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add exercise"
          style={styles.addExercise}
        >
          <Icon name="plus" size={17} color={colors.muted} />
          <Text style={styles.addExerciseText}>Add exercise</Text>
        </Pressable>
      </ScrollView>

      <FinishBar onFinish={handleFinish} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingHorizontal: 22,
    paddingBottom: 110,
  },
  addExercise: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addExerciseText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
});
