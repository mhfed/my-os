import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { AnimatedCard, PressableScale, ShimmerView } from '@/components/motion';
import { EnergyOrb, SkiaBackground } from '@/components/skia';
import {
  CurrencyChip,
  GameIconButton,
  GamePanel,
  Unicon3D,
  StarRating,
} from '@/components/game';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useJournalStore } from '@/store/journalStore';
import { useInboxStore } from '@/store/inboxStore';
import { getGreeting, todayKey } from '@/utils/day';
import type { Task } from '@/types/task';

import { HabitPill } from './components/HabitPill';
import { QuickCapture } from './components/QuickCapture';
import { TaskRow } from './components/TaskRow';
import { StreakIndicator } from './components/StreakIndicator';

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
    100 * (0.5 * taskRatio + 0.4 * habitRatio + 0.1 * journalToday),
  );

  const focus = Math.round(taskRatio * 100);
  const bodyVal = Math.round(habitRatio * 100);
  const mind = journalToday ? ((todayEntry?.mood ?? 0) + 1) * 20 : 0;

  // --- Inbox ---
  const openCount = useInboxStore.getState().openCount();

  const openInbox = () => router.push('/inbox');

  // Playful "level" derived from today's score so the HUD always feels alive.
  const level = Math.max(1, Math.ceil(score / 20));
  const starsFilled = Math.min(3, Math.max(0, Math.round(score / 34)));

  // --- Streak calculation (simplified: consecutive days with tasks done) ---
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    // Calculate streak based on task completion history
    // For now, use a simple heuristic based on today's progress
    const todayProgress = todayDoneTasks >= 1 || doneTodayCount >= 1 ? 1 : 0;
    setStreak(todayProgress);
  }, [todayDoneTasks, doneTodayCount]);

  // Time-based greeting
  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <SkiaBackground domain='today' intensity={0.42} />
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HUD bar — avatar + level, resource chips, inbox affordance */}
        <AnimatedCard index={0} style={styles.hud}>
          <PressableScale onPress={openInbox} hitSlop={8} haptic='selection'>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={gradients.purple}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarLetter}>H</Text>
              </LinearGradient>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{level}</Text>
              </View>
            </View>
          </PressableScale>

          <View style={styles.hudResources}>
            <CurrencyChip kind='coins' value={score} />
            <CurrencyChip kind='gems' value={doneTodayCount} />
          </View>

          <GameIconButton
            icon='bell-outline'
            variant='gold'
            size={44}
            onPress={openInbox}
          />
        </AnimatedCard>

        {/* Hero — Skia energy orb inside a glossy panel */}
        <AnimatedCard index={1}>
          <GamePanel style={styles.heroPanel}>
            <LinearGradient
              colors={['rgba(109,94,247,0.18)', 'rgba(79,140,255,0.04)']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.95, y: 1 }}
              style={styles.heroAura}
              pointerEvents='none'
            />
            <View style={styles.heroHalo} pointerEvents='none' />
            {/* Shimmer overlay */}
            <ShimmerView
              width={320}
              height={260}
              duration={3200}
              color='rgba(255,255,255,0.22)'
            />
            <LinearGradient
              colors={gradients.gloss}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.7 }}
              style={styles.heroGloss}
              pointerEvents='none'
            />
            <View style={styles.heroTop}>
              <View style={styles.heroTopLeft}>
                <Text style={styles.heroGreeting}>{greeting}</Text>
                <Text style={styles.heroName}>Minh Hiếu</Text>
                <StreakIndicator count={streak} />
              </View>
              <StarRating filled={starsFilled} count={3} size={20} />
            </View>
            <View style={styles.ringBlock}>
              <EnergyOrb
                score={score}
                focus={focus}
                body={bodyVal}
                mind={mind}
              />
            </View>
          </GamePanel>
        </AnimatedCard>

        {/* Today's tasks */}
        <AnimatedCard index={2} style={styles.section}>
          <GamePanel
            title="Today's quests"
            headerLeft={<Unicon3D name="clipboard-notes" color={colors.blue} size={28} />}
            headerRight={
              <View style={styles.countChip}>
                <Text style={styles.countText}>
                  {todayDoneTasks}/{todayTotalTasks}
                </Text>
              </View>
            }
          >
            <View style={styles.taskList}>
              {visibleTasks.map((task, i) => (
                <AnimatedCard key={task.id} index={3 + i}>
                  <TaskRow task={task} onToggle={toggleTask} />
                </AnimatedCard>
              ))}
            </View>
          </GamePanel>
        </AnimatedCard>

        {/* Habits */}
        <AnimatedCard index={4} style={styles.section}>
          <GamePanel
            title='Daily rituals'
            headerLeft={<Unicon3D name="check-circle" color={colors.orange} size={28} />}
            headerRight={
              <View style={styles.countChip}>
                <Text style={styles.countText}>
                  {doneTodayCount}/{totalHabits}
                </Text>
              </View>
            }
            flush
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.habitRow}
            >
              {habitViews.map((habit) => (
                <HabitPill
                  key={habit.id}
                  habit={habit}
                  onToggle={toggleToday}
                />
              ))}
            </ScrollView>
          </GamePanel>
        </AnimatedCard>

        {/* Quick capture */}
        <AnimatedCard index={5} style={styles.section}>
          <GamePanel alt>
            <QuickCapture
              onCapture={(text) => useInboxStore.getState().capture(text)}
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

  // --- HUD bar ---
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  avatarWrap: {
    width: 50,
    height: 50,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarLetter: {
    fontFamily: fonts.displayExtra,
    fontSize: 20,
    color: colors.white,
    ...textShadow.button,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    minWidth: 24,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontFamily: fonts.displayExtra,
    fontSize: 10,
    color: colors.text,
  },
  hudResources: {
    flexDirection: 'row',
    gap: 8,
  },

  // --- Hero panel ---
  heroPanel: {
    overflow: 'hidden',
    paddingBottom: 8,
    minHeight: 312,
  },
  heroAura: {
    ...StyleSheet.absoluteFillObject,
  },
  heroHalo: {
    position: 'absolute',
    top: 88,
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(79,140,255,0.12)',
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 6,
  },
  heroGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heroTopLeft: {
    gap: 4,
  },
  heroGreeting: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    color: colors.muted,
  },
  heroName: {
    fontFamily: fonts.displayExtra,
    fontSize: 26,
    color: colors.text,
    ...textShadow.emboss,
  },
  ringBlock: {
    alignItems: 'center',
  },

  // --- sections ---
  section: {
    marginTop: 16,
  },
  countChip: {
    paddingHorizontal: 12,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
  },
  taskList: {
    gap: 10,
  },
  habitRow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
