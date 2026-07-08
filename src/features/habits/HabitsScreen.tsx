import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { GameIconButton } from '@/components/game';
import { Icon } from '@/theme/icons';
import { useHabitsStore } from '@/store/habitsStore';

import { HabitCard } from './components/HabitCard';
import { WeeklyGrid } from './components/WeeklyGrid';
import { AddHabitModal } from './components/AddHabitModal';

/**
 * Habits tracker screen (DESIGN_SPEC §5.5) — Vietnamese-first: "Thói quen",
 * completion %, weekly grid, and a scrollable list of HabitCards.
 */
export function HabitsScreen() {
  const ready = useHabitsStore((s) => s.ready);
  const init = useHabitsStore((s) => s.init);
  useHabitsStore((s) => s.habits);
  useHabitsStore((s) => s.logs);
  const views = useHabitsStore((s) => s.views);
  const completion = useHabitsStore((s) => s.completion);
  const toggleLog = useHabitsStore((s) => s.toggleLog);

  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  const pct = useMemo(() => completion(), [views, ready]);

  if (!ready) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]} edges={['top']}>
        <View style={styles.center} />
      </SafeAreaView>
    );
  }

  const habitViews = views();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      {/* Header */}
      <AnimatedCard index={0} style={styles.headerWrap}>
        <View style={styles.headerCard}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Thói quen</Text>
              <Text style={styles.subtitle}>
                {habitViews.filter((h) => h.doneToday).length}/{habitViews.length} hôm nay
              </Text>
            </View>
            <View style={styles.headerRight}>
              <GameIconButton
                icon='plus'
                variant='gem'
                size={38}
                onPress={() => setAddVisible(true)}
                accessibilityLabel='Thêm thói quen'
              />
              <View style={styles.completionBox}>
                <Text style={styles.completionValue}>{pct}%</Text>
                <Text style={styles.completionLabel}>hoàn thành</Text>
              </View>
            </View>
          </View>
        </View>
      </AnimatedCard>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <WeeklyGrid views={habitViews} onToggleLog={toggleLog} />

        {habitViews.map((habit, index) => (
          <AnimatedCard key={habit.id} index={index + 1}>
            <HabitCard habit={habit} index={index} />
          </AnimatedCard>
        ))}
      </ScrollView>

      <AddHabitModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
      />
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerCard: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {},
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  completionBox: {
    alignItems: 'flex-end',
  },
  completionValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 30,
    lineHeight: 30,
    color: colors.green,
  },
  completionLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  content: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabClear,
    gap: spacing.sm,
  },
});
