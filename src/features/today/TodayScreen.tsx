import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { AnimatedCard } from '@/components/motion';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useJournalStore } from '@/store/journalStore';
import { useInboxStore } from '@/store/inboxStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useGymStore } from '@/store/gymStore';
import { useFinanceStore } from '@/store/financeStore';

import { TodayAppBar } from './components/TodayAppBar';
import { ModuleShortcuts } from './components/ModuleShortcuts';
import { QuickCapture } from './components/QuickCapture';
import { DashboardFinance } from './components/DashboardFinance';
import { DashboardProductivity } from './components/DashboardProductivity';
import { DashboardHealth } from './components/DashboardHealth';

/**
 * Lumina OS Redesigned Home Screen Dashboard (DESIGN_SPEC §5.1)
 *
 * Aggregate dashboard surface featuring highly polished, custom SVG charts
 * for core features (Finance, Productivity/Tasks/Habits, Health).
 * Completely flat minimalist aesthetic, answer-first data display, Vietnamese labels.
 */
export function TodayScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);

  // Store ready states for initialization gating
  const tasksReady = useTasksStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const journalReady = useJournalStore((s) => s.ready);
  const inboxReady = useInboxStore((s) => s.ready);
  const settingsReady = useSettingsStore((s) => s.ready);
  const gymReady = useGymStore((s) => s.ready);
  const financeReady = useFinanceStore((s) => s.ready);

  // Subscriptions to refresh lists on state change
  useTasksStore((s) => s.tasks);
  useHabitsStore((s) => s.habits);
  useHabitsStore((s) => s.logs);
  useGymStore((s) => s.history);
  useFinanceStore((s) => s.transactions);

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
        useGymStore.getState().init(),
        useFinanceStore.getState().init(),
      ]);
    }
  }, [initStarted]);

  const allReady =
    tasksReady &&
    habitsReady &&
    journalReady &&
    inboxReady &&
    settingsReady &&
    gymReady &&
    financeReady;

  // Derived values via getState() after early return
  const getTasksTodayData = () => {
    const tasks = useTasksStore.getState().tasks;
    const sectionOf = useTasksStore.getState().sectionOf;
    const todaySection = tasks.filter((t) => sectionOf(t) === 'today');
    const todayDone = todaySection.filter((t) => t.done).length;
    return { done: todayDone, total: todaySection.length };
  };

  const getHabitsTodayData = () => {
    const doneToday = useHabitsStore.getState().doneTodayCount();
    const totalViews = useHabitsStore.getState().views().length;
    return { done: doneToday, total: totalViews };
  };

  const getGreetingData = () => {
    const { done: taskDone, total: taskTotal } = getTasksTodayData();
    const { done: habitDone, total: habitTotal } = getHabitsTodayData();
    const taskRatio = taskTotal > 0 ? taskDone / taskTotal : 0;
    const habitRatio = habitTotal > 0 ? habitDone / habitTotal : 0;
    const score = Math.round(100 * (0.6 * taskRatio + 0.4 * habitRatio));
    const level = Math.max(1, Math.ceil(score / 20));
    const streak = taskDone >= 1 || habitDone >= 1 ? 1 : 0;
    return { level, streak };
  };

  const { level, streak } = allReady
    ? getGreetingData()
    : { level: 1, streak: 0 };

  const openCount = useInboxStore((s) => s.items.filter((i) => i.status === 'inbox').length);
  const openInbox = useCallback(() => router.push('/inbox'), [router]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void Promise.all([
      useTasksStore.getState().init(),
      useHabitsStore.getState().init(),
      useJournalStore.getState().init(),
      useInboxStore.getState().init(),
      useSettingsStore.getState().init(),
      useGymStore.getState().init(),
      useFinanceStore.getState().init(),
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
          greeting='Chào ngày mới'
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
          {/* Module shortcuts */}
          <ModuleShortcuts />

          {/* Core Feature Dashboard Cards */}
          <AnimatedCard index={1}>
            <DashboardFinance />
          </AnimatedCard>

          <AnimatedCard index={2}>
            <DashboardProductivity />
          </AnimatedCard>

          <AnimatedCard index={3}>
            <DashboardHealth />
          </AnimatedCard>

          {/* Quick Capture inbox bar */}
          <AnimatedCard index={4} style={styles.section}>
            <QuickCapture
              onCapture={(text: string) => useInboxStore.getState().capture(text)}
              openCount={openCount}
              onOpenInbox={openInbox}
            />
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
    paddingHorizontal: spacing.md,
  },
  content: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.tabClear,
  },
  section: {
    marginTop: spacing.xs,
  },
});
