import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { GamePanel } from '@/components/game';
import { useGymStore } from '@/store/gymStore';

import { WorkoutHeader } from './components/WorkoutHeader';
import { LoggedExerciseCard } from './components/LoggedExerciseCard';
import { ActiveExerciseCard } from './components/ActiveExerciseCard';
import { FinishBar } from './components/FinishBar';

/**
 * Gym Tracker screen (DESIGN_SPEC §5.4) — active workout logging with
 * exercise cards, set tracking, and finish bar.
 */
export function GymScreen({ isEmbedded }: { isEmbedded?: boolean }) {
  const router = useRouter();
  const logged = useGymStore((state) => state.logged);
  const active = useGymStore((state) => state.active);
  const addSet = useGymStore((state) => state.addSet);
  const addExercise = useGymStore((state) => state.addExercise);
  const finishWorkout = useGymStore((state) => state.finishWorkout);
  const cancelWorkout = useGymStore((state) => state.cancelWorkout);

  const progressLabel = `${logged.length + (active ? 1 : 0)} bài tập`;

  const handleBack = useCallback(() => {
    cancelWorkout();
    router.back();
  }, [cancelWorkout, router]);

  const renderContent = () => (
    <View style={{ flex: 1 }}>
      {!isEmbedded && (
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.screenGlow}
          pointerEvents='none'
        />
      )}

      {/* Header */}
      <AnimatedCard index={0} style={styles.headerWrap}>
        <GamePanel style={styles.headerPanel}>
          <View style={styles.header}>
            {!isEmbedded && (
              <PressableScale
                onPress={handleBack}
                haptic='light'
                hitSlop={8}
                style={styles.back}
                accessibilityRole='button'
                accessibilityLabel='Quay lại'
              >
                <Icon name='arrow-left' size={24} color={colors.text} />
              </PressableScale>
            )}
            <View style={[styles.headerCenter, isEmbedded && { paddingLeft: spacing.sm, paddingVertical: spacing.xs }]}>
              <Text style={styles.title}>Tập luyện</Text>
              <Text style={styles.subtitle}>{progressLabel}</Text>
            </View>
          </View>
        </GamePanel>
      </AnimatedCard>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {logged.map((exercise, index) => (
          <AnimatedCard key={exercise.name} index={index + 1}>
            <LoggedExerciseCard exercise={exercise} />
          </AnimatedCard>
        ))}

        {active ? (
          <AnimatedCard index={logged.length + 1}>
            <ActiveExerciseCard exercise={active} onAddSet={addSet} />
          </AnimatedCard>
        ) : null}

        <PressableScale
          onPress={() => addExercise('Bài tập mới')}
          haptic='selection'
          accessibilityRole='button'
          accessibilityLabel='Thêm bài tập'
          style={styles.addExercise}
        >
          <Icon name='plus' size={17} color={colors.gold} />
          <Text style={styles.addExerciseText}>Thêm bài tập</Text>
        </PressableScale>
      </ScrollView>

      <FinishBar onFinish={finishWorkout} />
    </View>
  );

  if (isEmbedded) return renderContent();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerPanel: {
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabClear,
    gap: spacing.md,
  },
  addExercise: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: glass.rim,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  addExerciseText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.gold,
  },
});
