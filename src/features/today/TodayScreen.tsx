import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, glass } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { AnimatedCard } from '@/components/motion';
import { GamePanel } from '@/components/game';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useJournalStore } from '@/store/journalStore';
import { useInboxStore } from '@/store/inboxStore';
import { useSettingsStore } from '@/store/settingsStore';
import { todayKey } from '@/utils/day';

import { TodayAppBar } from './components/TodayAppBar';
import { StatsBar } from './components/StatsBar';
import { DualProgress } from './components/DualProgress';
import { ModuleShortcuts } from './components/ModuleShortcuts';
import { QuickCapture } from './components/QuickCapture';

/**
 * Lumina OS Today (DESIGN_SPEC §5.1) — aggregate surface: greeting + level,
 * stat bar, dual progress (tasks + habits rings), module shortcuts, and a
 * quick-capture inbox bar. Vietnamese-first labels.
 *
 * Redesigned with Tasks/Finance glass card aesthetic.
 */
export function TodayScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);

  // All store hooks before any early return (§AGENTS.md AI gotcha #2)
  const tasksReady = useTasksStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const journalReady = useJournalStore((s) => s.ready);
  const inboxReady = useInboxStore((s) => s.ready);
  const settingsReady = useSettingsStore((s) => s.ready);
  const tasks = useTasksStore((s) => s.tasks);
  useHabitsStore((s) => s.habits);
  useHabitsStore((s) => s.logs);
  useJournalStore((s) => s.entries);
  useInboxStore((s) => s.items);

  const [initStarted, setInitStarted] = useState(false);
  useEffect(() => {
    if (!initStarted) {
      setInitStarted(true);
      void Promise.all([
        useTasksStore.getState().init(),
        useHabitsStore.getState().init(),
        useJournalStore.getState().init(),
        useInboxStore.getState().init(),
        useSettingsStore.getState().init(),
      ]);
    }
  }, [initStarted]);

  const allReady = tasksReady && habitsReady && journalReady && inboxReady && settingsReady;

  // --- Derived values (via getState() for function selectors) ---
  const sectionOf = useTasksStore.getState().sectionOf;
  const todaySection = tasks.filter((t) => sectionOf(t) === 'today');
  const todayDoneTasks = todaySection.filter((t) => t.done).length;
  const doneTodayCount = useHabitsStore.getState().doneTodayCount();
  const todayEntry = useJournalStore.getState().entryFor(todayKey());
  const journalToday = todayEntry ? 1 : 0;

  const taskRatio = todayDoneTasks / Math.max(1, todaySection.length);
  const habitRatio = doneTodayCount / Math.max(1, useHabitsStore.getState().views().length);

  const score = useMemo(
    () => Math.round(100 * (0.5 * taskRatio + 0.4 * habitRatio + 0.1 * journalToday)),
    [taskRatio, habitRatio, journalToday],
  );

  const level = Math.max(1, Math.ceil(score / 20));
  const streak = todayDoneTasks >= 1 || doneTodayCount >= 1 ? 1 : 0;
  const openCount = useInboxStore.getState().openCount();
  const openInbox = useCallback(() => router.push('/inbox'), [router]);
  const greeting = 'Chào ngày mới';

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void Promise.all([
      useTasksStore.getState().init(),
      useHabitsStore.getState().init(),
      useJournalStore.getState().init(),
      useInboxStore.getState().init(),
      useSettingsStore.getState().init(),
    ]).then(() => setRefreshing(false));
  }, []);

  const handleScroll = useCallback((e: any) => {
    scrollOffset.current = e.nativeEvent.contentOffset.y;
  }, []);
  const handleContentSizeChange = useCallback(() => {
    if (scrollOffset.current > 0) {
      scrollRef.current?.scrollTo({ y: scrollOffset.current, animated: false });
    }
  }, []);

  if (!allReady) return <View style={styles.screen} />;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      <SafeAreaView edges={['top']} style={styles.safe}>
        <TodayAppBar
          greeting={greeting}
          level={level}
          streak={streak}
          onOpenProfile={() => {}}
          onOpenInbox={openInbox}
        />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.gold}
            />
          }
        >
          <StatsBar
            taskDone={todayDoneTasks}
            taskTotal={todaySection.length}
            habitDone={doneTodayCount}
            habitTotal={useHabitsStore.getState().views().length}
            inboxOpen={openCount}
            streak={streak}
            journalDone={journalToday > 0}
          />

          <DualProgress />

          <ModuleShortcuts />

          <AnimatedCard index={5} style={styles.section}>
            <GamePanel>
              <QuickCapture
                onCapture={(text: string) => useInboxStore.getState().capture(text)}
                openCount={openCount}
                onOpenInbox={openInbox}
              />
            </GamePanel>
          </AnimatedCard>
        </ScrollView>
      </SafeAreaView>
    </View>
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
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.tabClear,
  },
  section: {
    marginTop: spacing.md,
  },
});
