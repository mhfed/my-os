import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { AnimatedCard } from '@/components/motion';
import { GamePanel } from '@/components/game';
import { FarmBackground } from '@/components/skia';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useJournalStore } from '@/store/journalStore';
import { useInboxStore } from '@/store/inboxStore';
import { useSettingsStore } from '@/store/settingsStore';
import { todayKey } from '@/utils/day';

import { TodayHud } from './components/TodayHud';
import { StatsBar } from './components/StatsBar';
import { DualProgress } from './components/DualProgress';
import { ModuleShortcuts } from './components/ModuleShortcuts';
import { QuickCapture } from './components/QuickCapture';

export function TodayScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);

  // Store subscriptions for re-rendering
  const tasksReady = useTasksStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const journalReady = useJournalStore((s) => s.ready);
  const inboxReady = useInboxStore((s) => s.ready);
  const settingsReady = useSettingsStore((s) => s.ready);
  const tasks = useTasksStore((s) => s.tasks);

  // Init every store Today reads
  const [initStarted, setInitStarted] = useState(false);
  useEffect(() => {
    if (!initStarted) {
      setInitStarted(true);
      useTasksStore.getState().init();
      useHabitsStore.getState().init();
      useJournalStore.getState().init();
      useInboxStore.getState().init();
      useSettingsStore.getState().init();
    }
  }, [initStarted]);

  const allReady = tasksReady && habitsReady && journalReady && inboxReady && settingsReady;

  // --- Derived values ---
  const sectionOf = useTasksStore.getState().sectionOf;
  const todaySection = tasks.filter((t) => sectionOf(t) === 'today');
  const todayDoneTasks = todaySection.filter((t) => t.done).length;

  const doneTodayCount = useHabitsStore.getState().doneTodayCount();

  const todayEntry = useJournalStore.getState().entryFor(todayKey());
  const journalToday = todayEntry ? 1 : 0;

  const taskRatio = todayDoneTasks / Math.max(1, todaySection.length);
  const habitRatio = doneTodayCount / Math.max(1, useHabitsStore.getState().views().length);

  const score = useMemo(
    () =>
      Math.round(
        100 * (0.5 * taskRatio + 0.4 * habitRatio + 0.1 * journalToday),
      ),
    [taskRatio, habitRatio, journalToday],
  );

  const streak = useMemo(
    () => (todayDoneTasks >= 1 || doneTodayCount >= 1 ? 1 : 0),
    [todayDoneTasks, doneTodayCount],
  );

  const openCount = useInboxStore.getState().openCount();
  const openInbox = useCallback(() => router.push('/inbox'), [router]);

  // Pull-to-refresh
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

  // Scroll position memory
  const handleScroll = useCallback((e: any) => {
    scrollOffset.current = e.nativeEvent.contentOffset.y;
  }, []);

  const handleContentSizeChange = useCallback(() => {
    if (scrollOffset.current > 0) {
      scrollRef.current?.scrollTo({ y: scrollOffset.current, animated: false });
    }
  }, []);

  if (!allReady) {
    return <View style={styles.placeholder} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FarmBackground domain='today' />
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.purple}
          />
        }
      >
        {/* ─── HUD: greeting, level, streak ─── */}
        <TodayHud
          score={score}
          doneTodayCount={doneTodayCount}
          streak={streak}
          onOpenInbox={openInbox}
        />

        {/* ─── Stats bar: key metrics ─── */}
        <StatsBar
          taskDone={todayDoneTasks}
          taskTotal={todaySection.length}
          habitDone={doneTodayCount}
          habitTotal={useHabitsStore.getState().views().length}
          inboxOpen={openCount}
          streak={streak}
          journalDone={journalToday > 0}
        />

        {/* ─── Dual progress: tasks + habits side by side ─── */}
        <DualProgress />

        {/* ─── Module shortcuts: pinned modules ─── */}
        <ModuleShortcuts />

        {/* ─── Quick capture bar ─── */}
        <AnimatedCard index={3} style={styles.section}>
          <GamePanel alt>
            <QuickCapture
              onCapture={(text: string) => useInboxStore.getState().capture(text)}
              openCount={openCount}
              onOpenInbox={openInbox}
            />
          </GamePanel>
        </AnimatedCard>
      </ScrollView>
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
  placeholder: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  section: {
    marginTop: 16,
  },
});
