import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { EnergyOrb, SkiaBackground } from '@/components/skia';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useJournalStore } from '@/store/journalStore';
import { useInboxStore } from '@/store/inboxStore';
import { todayKey } from '@/utils/day';
import type { Task } from '@/types/task';

import { HabitPill } from './components/HabitPill';
import { QuickCapture } from './components/QuickCapture';
import { TaskRow } from './components/TaskRow';

export function TodayScreen() {
  const router = useRouter();

  // Subscribe to the raw state slices so the screen re-renders on change; the
  // derived values are computed below from these + the store selectors.
  const tasks = useTasksStore((s) => s.tasks);
  const tasksReady = useTasksStore((s) => s.ready);
  const toggleTask = useTasksStore((s) => s.toggleTask);

  const habitsLogs = useHabitsStore((s) => s.logs);
  const habitsReady = useHabitsStore((s) => s.ready);
  const toggleToday = useHabitsStore((s) => s.toggleToday);

  const journalEntries = useJournalStore((s) => s.entries);
  const journalReady = useJournalStore((s) => s.ready);

  const inboxItems = useInboxStore((s) => s.items);
  const inboxReady = useInboxStore((s) => s.ready);

  // Init every store Today reads (all idempotent).
  useEffect(() => {
    useTasksStore.getState().init();
    useHabitsStore.getState().init();
    useJournalStore.getState().init();
    useInboxStore.getState().init();
  }, []);

  const ready = tasksReady && habitsReady && journalReady && inboxReady;
  if (!ready) {
    return <View style={styles.placeholder} />;
  }

  // --- Tasks: everything in the "today" section (done + not-done). ---
  const sectionOf = useTasksStore.getState().sectionOf;
  const todaySection = tasks.filter((t) => sectionOf(t) === 'today');
  const sortedToday = [...todaySection].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1; // not-done first
    return (b.dueDate ?? b.createdAt) - (a.dueDate ?? a.createdAt);
  });
  const todayTotalTasks = todaySection.length;
  const todayDoneTasks = todaySection.filter((t) => t.done).length;
  const visibleTasks: Task[] = sortedToday.slice(0, 4);

  // --- Habits ---
  const habitViews = useHabitsStore.getState().views();
  const doneTodayCount = useHabitsStore.getState().doneTodayCount();
  const totalHabits = habitViews.length;

  // --- Journal ---
  const todayEntry = useJournalStore.getState().entryFor(todayKey());
  const journalToday = todayEntry ? 1 : 0;

  // --- Score ---
  const taskRatio = todayDoneTasks / Math.max(1, todayTotalTasks);
  const habitRatio = doneTodayCount / Math.max(1, totalHabits);
  const score = Math.round(
    100 * (0.5 * taskRatio + 0.4 * habitRatio + 0.1 * journalToday)
  );

  const focus = Math.round(taskRatio * 100);
  const bodyVal = Math.round(habitRatio * 100);
  const mind = journalToday ? ((todayEntry?.mood ?? 0) + 1) * 20 : 0;

  // --- Inbox ---
  const openCount = useInboxStore.getState().openCount();

  const openInbox = () => router.push('/inbox');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SkiaBackground domain="today" intensity={0.42} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <AnimatedCard index={0} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>Khoa</Text>
          </View>
          <PressableScale onPress={openInbox} hitSlop={8} haptic="selection">
            <LinearGradient
              colors={[colors.purple, colors.teal]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarLetter}>K</Text>
            </LinearGradient>
            {openCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{openCount}</Text>
              </View>
            ) : null}
          </PressableScale>
        </AnimatedCard>

        {/* Hero — Skia energy orb (ring sweeps to score on mount) */}
        <AnimatedCard index={1} style={styles.ringBlock}>
          <EnergyOrb score={score} focus={focus} body={bodyVal} mind={mind} />
        </AnimatedCard>

        {/* Today's tasks */}
        <AnimatedCard index={2}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s tasks</Text>
            <Text style={styles.count}>
              {todayDoneTasks}/{todayTotalTasks}
            </Text>
          </View>
          <View style={styles.taskList}>
            {visibleTasks.map((task, i) => (
              <AnimatedCard key={task.id} index={3 + i}>
                <TaskRow task={task} onToggle={toggleTask} />
              </AnimatedCard>
            ))}
          </View>
        </AnimatedCard>

        {/* Habits */}
        <AnimatedCard index={4}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habits</Text>
            <Text style={styles.count}>
              {doneTodayCount}/{totalHabits}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitRow}
            style={styles.habitScroll}
          >
            {habitViews.map((habit) => (
              <HabitPill key={habit.id} habit={habit} onToggle={toggleToday} />
            ))}
          </ScrollView>
        </AnimatedCard>

        {/* Quick capture */}
        <AnimatedCard index={5}>
          <QuickCapture
            onCapture={(text) => useInboxStore.getState().capture(text)}
            openCount={openCount}
            onOpenInbox={openInbox}
          />
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
  placeholder: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 22,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  ringBlock: {
    alignItems: 'center',
  },
  greeting: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 3,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.3,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.monoSemibold,
    fontSize: 16,
    color: '#0A0A0F',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.purple,
    borderWidth: 2,
    borderColor: colors.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  count: {
    fontFamily: fonts.monoRegular,
    fontSize: 13,
    color: colors.muted,
  },
  taskList: {
    gap: 10,
    marginBottom: 30,
  },
  habitScroll: {
    marginBottom: 30,
  },
  habitRow: {
    gap: 10,
  },
});
