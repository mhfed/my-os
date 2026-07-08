import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { GamePanel } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { taskTimeLabel, useTasksStore } from '@/store/tasksStore';
import { useGoalStore } from '@/store/goalStore';
import type { Task } from '@/types/task';

import { AddTaskModal } from './components/AddTaskModal';
import { FilterPills } from './components/FilterPills';
import { SectionHeader } from './components/SectionHeader';
import { TaskCard } from './components/TaskCard';

const FAB_GRADIENT = [colors.blue, colors.blueDeep] as const;
const DAY_MS = 86_400_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTaskTimeSegment(task: Task): 'morning' | 'afternoon' | 'evening' | 'anytime' {
  let timeStr = task.routineTime;
  if (!timeStr && task.dueDate != null) {
    const d = new Date(task.dueDate);
    if (d.getHours() !== 0 || d.getMinutes() !== 0) {
      timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }
  if (!timeStr) return 'anytime';
  const [h] = timeStr.split(':').map(Number);
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  return 'evening';
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScreenMode = 'dashboard' | 'all';
type TimeSegment = 'all' | 'morning' | 'afternoon' | 'evening' | 'anytime';
type SectionTone = 'overdue' | 'today' | 'upcoming' | 'completed' | 'anytime';

interface SectionItem {
  kind: 'section';
  id: string;
  label: string;
  count: number;
  tone: SectionTone;
}

interface TaskItem {
  kind: 'task';
  id: string;
  task: Task;
  timeLabel: string;
  overdue: boolean;
  goalTitle?: string;
}

type ListItem = SectionItem | TaskItem;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TasksScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const ready = useTasksStore((s) => s.ready);
  const activeFilter = useTasksStore((s) => s.activeFilter);
  const goals = useGoalStore((s) => s.goals);
  const init = useTasksStore((s) => s.init);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const toggleSubtask = useTasksStore((s) => s.toggleSubtask);
  const setFilter = useTasksStore((s) => s.setFilter);
  const addTomorrowTask = useTasksStore((s) => s.addTomorrowTask);

  const [screenMode, setScreenMode] = useState<ScreenMode>('dashboard');
  const [activeTimeSegment, setActiveTimeSegment] = useState<TimeSegment>('all');
  const [addVisible, setAddVisible] = useState(false);
  const [tomorrowTitle, setTomorrowTitle] = useState('');

  useEffect(() => {
    void init();
  }, [init]);

  const startToDay = new Date().setHours(0, 0, 0, 0);
  const tomorrowStart = startToDay + DAY_MS;
  const dayAfterTomorrowStart = tomorrowStart + DAY_MS;

  // goalId -> title lookup so each task row can show its contributing goal.
  const goalTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const g of goals) map[g.id] = g.title;
    return map;
  }, [goals]);

  // Counts for the filters
  const activeCount = useMemo(
    () => tasks.filter((t) => !t.done && (t.dueDate == null || t.dueDate >= startToDay)).length,
    [tasks],
  );
  const overdueCount = useMemo(
    () => tasks.filter((t) => !t.done && t.dueDate != null && t.dueDate < startToDay).length,
    [tasks],
  );
  const completedCount = useMemo(
    () => tasks.filter((t) => t.done).length,
    [tasks],
  );

  // ---------------------------------------------------------------------------
  // Dashboard Calculations
  // ---------------------------------------------------------------------------

  const urgentTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.done) return false;
      if (t.recurrence === 'daily') return false;
      if (t.dueDate != null && t.dueDate < startToDay) return true;
      if (t.priority === 'P0' && t.dueDate != null && t.dueDate >= startToDay && t.dueDate < tomorrowStart) return true;
      return false;
    });
  }, [tasks, startToDay, tomorrowStart]);

  const highPriorityTasks = useMemo(() => {
    const urgentIds = new Set(urgentTasks.map((t) => t.id));
    return tasks.filter((t) => {
      if (t.done) return false;
      if (t.recurrence === 'daily') return false;
      if (urgentIds.has(t.id)) return false;
      if (t.priority !== 'P0' && t.priority !== 'P1') return false;
      return t.dueDate == null || (t.dueDate >= startToDay && t.dueDate < tomorrowStart);
    });
  }, [tasks, urgentTasks, startToDay, tomorrowStart]);

  const dailyRoutines = useMemo(() => {
    return tasks
      .filter((t) => t.recurrence === 'daily')
      .sort((a, b) => {
        const timeA = a.routineTime ?? '00:00';
        const timeB = b.routineTime ?? '00:00';
        return timeA.localeCompare(timeB);
      });
  }, [tasks]);

  const tomorrowTasks = useMemo(() => {
    return tasks.filter((t) => !t.done && t.dueDate != null && t.dueDate >= tomorrowStart && t.dueDate < dayAfterTomorrowStart && t.recurrence !== 'daily');
  }, [tasks, tomorrowStart, dayAfterTomorrowStart]);

  const todayCompletedTasks = useMemo(() => {
    return tasks.filter((t) => t.done && t.completedAt != null && t.completedAt >= startToDay);
  }, [tasks, startToDay]);

  const todayTotalCount = useMemo(() => {
    const todayActive = tasks.filter((t) => {
      if (t.done) return false;
      if (t.dueDate != null && t.dueDate >= tomorrowStart) return false;
      return true;
    }).length;
    return todayActive + todayCompletedTasks.length;
  }, [tasks, todayCompletedTasks, tomorrowStart]);

  // Glow Capsule segments widths
  const proportions = useMemo(() => {
    const total = urgentTasks.length + highPriorityTasks.length + dailyRoutines.filter(r => !r.done).length + todayCompletedTasks.length;
    if (total === 0) return { urgent: 0, high: 0, routine: 0, completed: 0 };
    return {
      urgent: (urgentTasks.length / total) * 100,
      high: (highPriorityTasks.length / total) * 100,
      routine: (dailyRoutines.filter(r => !r.done).length / total) * 100,
      completed: (todayCompletedTasks.length / total) * 100,
    };
  }, [urgentTasks, highPriorityTasks, dailyRoutines, todayCompletedTasks]);

  // Timeline segment counts
  const timelineCounts = useMemo(() => {
    const counts = { morning: 0, afternoon: 0, evening: 0, anytime: 0 };
    const todayTasks = tasks.filter((t) => !t.done && (t.dueDate == null || t.dueDate < tomorrowStart));
    for (const t of todayTasks) {
      const seg = getTaskTimeSegment(t);
      counts[seg]++;
    }
    return counts;
  }, [tasks, tomorrowStart]);

  // Filtered lists depending on timeline click
  const filterByTimeline = useCallback(<T extends Task>(list: T[]): T[] => {
    if (activeTimeSegment === 'all') return list;
    return list.filter((t) => getTaskTimeSegment(t) === activeTimeSegment);
  }, [activeTimeSegment]);

  const handleAddTomorrow = async () => {
    if (!tomorrowTitle.trim()) return;
    await addTomorrowTask(tomorrowTitle.trim());
    setTomorrowTitle('');
  };

  // ---------------------------------------------------------------------------
  // FlatList (Traditional Mode) Calculations
  // ---------------------------------------------------------------------------

  const flattenedList = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    const goalTitleOf = (task: Task) =>
      task.goalId ? goalTitleById[task.goalId] : undefined;

    if (activeFilter === 'Pending') {
      const pendingTasks = tasks.filter((t) => !t.done && (t.dueDate == null || t.dueDate >= startToDay));
      const groups = new Map<number, Task[]>();
      const anytimeTasks: Task[] = [];

      for (const t of pendingTasks) {
        if (t.dueDate != null) {
          const d = new Date(t.dueDate);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          if (!groups.has(dayStart)) groups.set(dayStart, []);
          groups.get(dayStart)!.push(t);
        } else {
          anytimeTasks.push(t);
        }
      }

      const sortedDays = Array.from(groups.keys()).sort((a, b) => a - b);

      for (const dayStart of sortedDays) {
        const dayTasks = groups.get(dayStart)!;
        dayTasks.sort((a, b) => a.dueDate! - b.dueDate!);

        const diffDays = Math.round((dayStart - startToDay) / DAY_MS);
        let label = '';
        if (diffDays === 0) label = 'Hôm nay';
        else if (diffDays === -1) label = 'Hôm qua';
        else if (diffDays === 1) label = 'Ngày mai';
        else {
          const d = new Date(dayStart);
          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          label = `${weekdays[d.getDay()]}, ${d.getDate()} Thg ${d.getMonth() + 1}`;
        }

        let tone: SectionTone = 'today';
        if (diffDays < 0) tone = 'overdue';
        else if (diffDays > 0) tone = 'upcoming';

        items.push({
          kind: 'section',
          id: `section-day-${dayStart}`,
          label: label.toUpperCase(),
          count: dayTasks.length,
          tone,
        });
        for (const task of dayTasks) {
          items.push({
            kind: 'task',
            id: task.id,
            task,
            timeLabel: taskTimeLabel(task),
            overdue: diffDays < 0,
            goalTitle: goalTitleOf(task),
          });
        }
      }

      if (anytimeTasks.length > 0) {
        anytimeTasks.sort((a, b) => b.createdAt - a.createdAt);
        items.push({
          kind: 'section',
          id: 'section-anytime',
          label: 'SẮP XẾP SAU',
          count: anytimeTasks.length,
          tone: 'anytime',
        });
        for (const task of anytimeTasks) {
          items.push({
            kind: 'task',
            id: task.id,
            task,
            timeLabel: taskTimeLabel(task),
            overdue: false,
            goalTitle: goalTitleOf(task),
          });
        }
      }
    } else if (activeFilter === 'Overdue') {
      const overdueTasks = tasks.filter((t) => !t.done && t.dueDate != null && t.dueDate < startToDay);
      const groups = new Map<number, Task[]>();

      for (const t of overdueTasks) {
        const d = new Date(t.dueDate!);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        if (!groups.has(dayStart)) groups.set(dayStart, []);
        groups.get(dayStart)!.push(t);
      }

      const sortedDays = Array.from(groups.keys()).sort((a, b) => a - b);

      for (const dayStart of sortedDays) {
        const dayTasks = groups.get(dayStart)!;
        dayTasks.sort((a, b) => a.dueDate! - b.dueDate!);

        const diffDays = Math.round((dayStart - startToDay) / DAY_MS);
        let label = '';
        if (diffDays === -1) label = 'Hôm qua';
        else {
          const d = new Date(dayStart);
          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          label = `${weekdays[d.getDay()]}, ${d.getDate()} Thg ${d.getMonth() + 1}`;
        }

        items.push({
          kind: 'section',
          id: `section-overdue-${dayStart}`,
          label: label.toUpperCase(),
          count: dayTasks.length,
          tone: 'overdue',
        });
        for (const task of dayTasks) {
          items.push({
            kind: 'task',
            id: task.id,
            task,
            timeLabel: taskTimeLabel(task),
            overdue: true,
            goalTitle: goalTitleOf(task),
          });
        }
      }
    } else {
      const completedTasks = tasks.filter((t) => t.done);
      const groups = new Map<number, Task[]>();

      for (const t of completedTasks) {
        const time = t.completedAt ?? t.createdAt;
        const d = new Date(time);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        if (!groups.has(dayStart)) groups.set(dayStart, []);
        groups.get(dayStart)!.push(t);
      }

      const sortedDays = Array.from(groups.keys()).sort((a, b) => b - a);

      for (const dayStart of sortedDays) {
        const dayTasks = groups.get(dayStart)!;
        dayTasks.sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt));

        const diffDays = Math.round((dayStart - startToDay) / DAY_MS);
        let label = '';
        if (diffDays === 0) label = 'Hôm nay';
        else if (diffDays === -1) label = 'Hôm qua';
        else {
          const d = new Date(dayStart);
          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          label = `${weekdays[d.getDay()]}, ${d.getDate()} Thg ${d.getMonth() + 1}`;
        }

        items.push({
          kind: 'section',
          id: `section-done-${dayStart}`,
          label: label.toUpperCase(),
          count: dayTasks.length,
          tone: 'completed',
        });
        for (const task of dayTasks) {
          items.push({
            kind: 'task',
            id: task.id,
            task,
            timeLabel: taskTimeLabel(task),
            overdue: false,
            goalTitle: goalTitleOf(task),
          });
        }
      }
    }

    return items;
  }, [tasks, activeFilter, goalTitleById, startToDay]);

  const getItemType = useCallback((item: ListItem): string => item.kind, []);
  const keyExtractor = useCallback((item: ListItem): string => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === 'section') {
        return <SectionHeader label={item.label} count={item.count} tone={item.tone} />;
      }
      return (
        <TaskCard
          task={item.task}
          timeLabel={item.timeLabel}
          overdue={item.overdue}
          goalTitle={item.goalTitle}
          onToggle={toggleTask}
          onToggleSubtask={toggleSubtask}
        />
      );
    },
    [toggleTask, toggleSubtask],
  );

  if (!ready) return <View style={styles.screen} />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      {/* Modern Sub-header with double view toggles */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Nhiệm vụ</Text>
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleBtn, screenMode === 'dashboard' && styles.toggleBtnActive]}
            onPress={() => setScreenMode('dashboard')}
          >
            <Text style={[styles.toggleText, screenMode === 'dashboard' && styles.toggleTextActive]}>
              Overview
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, screenMode === 'all' && styles.toggleBtnActive]}
            onPress={() => setScreenMode('all')}
          >
            <Text style={[styles.toggleText, screenMode === 'all' && styles.toggleTextActive]}>
              Tất cả
            </Text>
          </Pressable>
        </View>
      </View>

      {screenMode === 'dashboard' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Visual Overview Banner with Glow Proportions Bar */}
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overviewMeta}>
              <View>
                <Text style={styles.overviewLabel}>TIẾN ĐỘ HÔM NAY</Text>
                <Text style={styles.overviewTitle}>
                  {todayTotalCount > 0
                    ? `Hoàn thành ${todayCompletedTasks.length}/${todayTotalCount}`
                    : 'Không có nhiệm vụ'}
                </Text>
              </View>
              <Text style={styles.overviewPercent}>
                {todayTotalCount > 0
                  ? `${Math.round((todayCompletedTasks.length / todayTotalCount) * 100)}%`
                  : '0%'}
              </Text>
            </View>

            {/* Proportional Glow Capsule Bar */}
            <View style={styles.capsuleTrack}>
              {todayTotalCount === 0 ? (
                <View style={[styles.capsuleSegment, { width: '100%', backgroundColor: 'rgba(255,255,255,0.06)' }]} />
              ) : (
                <>
                  {proportions.urgent > 0 && (
                    <View style={[styles.capsuleSegment, { width: `${proportions.urgent}%`, backgroundColor: colors.red }]} />
                  )}
                  {proportions.high > 0 && (
                    <View style={[styles.capsuleSegment, { width: `${proportions.high}%`, backgroundColor: colors.orange }]} />
                  )}
                  {proportions.routine > 0 && (
                    <View style={[styles.capsuleSegment, { width: `${proportions.routine}%`, backgroundColor: colors.teal }]} />
                  )}
                  {proportions.completed > 0 && (
                    <View style={[styles.capsuleSegment, { width: `${proportions.completed}%`, backgroundColor: colors.green }]} />
                  )}
                </>
              )}
            </View>

            {/* Legend for the energy bar */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
                <Text style={styles.legendText}>Khẩn cấp ({urgentTasks.length})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
                <Text style={styles.legendText}>Ưu tiên ({highPriorityTasks.length})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.teal }]} />
                <Text style={styles.legendText}>Lặp lại ({dailyRoutines.filter(r => !r.done).length})</Text>
              </View>
            </View>
          </View>

          {/* Interactive Cyber Timeline Grid */}
          <View style={styles.timelineContainer}>
            <Text style={styles.sectionTitle}>BẢN ĐỒ THỜI GIAN</Text>
            <View style={styles.timelineTrack}>
              {[
                { key: 'all', label: 'TẤT CẢ', count: tasks.filter(t => !t.done).length, color: colors.blue },
                { key: 'morning', label: 'SÁNG (6-12h)', count: timelineCounts.morning, color: colors.teal },
                { key: 'afternoon', label: 'CHIỀU (12-18h)', count: timelineCounts.afternoon, color: colors.orange },
                { key: 'evening', label: 'TỐI (18-24h)', count: timelineCounts.evening, color: colors.purple },
              ].map((slot) => {
                const isActive = activeTimeSegment === slot.key;
                return (
                  <PressableScale
                    key={slot.key}
                    onPress={() => setActiveTimeSegment(isActive ? 'all' : (slot.key as TimeSegment))}
                    style={[
                      styles.timelineCell,
                      isActive ? { borderColor: slot.color, backgroundColor: tint(slot.color, '0F') } : null,
                    ]}
                    scaleTo={0.96}
                    haptic='light'
                  >
                    <Text style={[styles.timelineCellLabel, { color: isActive ? slot.color : colors.muted }]}>
                      {slot.label}
                    </Text>
                    <Text style={[styles.timelineCellCount, { color: colors.text }]}>
                      {slot.count}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          {/* 1. Urgent / Overdue / P0 due today Section */}
          {filterByTimeline(urgentTasks).length > 0 && (
            <View style={styles.dashboardSection}>
              <View style={styles.dashboardSectionHeader}>
                <Icon name='alert-decagram' size={16} color={colors.red} />
                <Text style={[styles.dashboardSectionTitle, { color: colors.red }]}>KHẨN CẤP / QUÁ HẠN</Text>
              </View>
              {filterByTimeline(urgentTasks).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  timeLabel={taskTimeLabel(task)}
                  overdue={task.dueDate != null && task.dueDate < startToDay}
                  goalTitle={task.goalId ? goalTitleById[task.goalId] : undefined}
                  onToggle={toggleTask}
                  onToggleSubtask={toggleSubtask}
                />
              ))}
            </View>
          )}

          {/* 2. High Priority Section */}
          {filterByTimeline(highPriorityTasks).length > 0 && (
            <View style={styles.dashboardSection}>
              <View style={styles.dashboardSectionHeader}>
                <Icon name='star' size={16} color={colors.orange} />
                <Text style={[styles.dashboardSectionTitle, { color: colors.orange }]}>NHIỆM VỤ ƯU TIÊN CAO</Text>
              </View>
              {filterByTimeline(highPriorityTasks).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  timeLabel={taskTimeLabel(task)}
                  overdue={false}
                  goalTitle={task.goalId ? goalTitleById[task.goalId] : undefined}
                  onToggle={toggleTask}
                  onToggleSubtask={toggleSubtask}
                />
              ))}
            </View>
          )}

          {/* 3. Daily Routines Section */}
          {filterByTimeline(dailyRoutines).length > 0 && (
            <View style={styles.dashboardSection}>
              <View style={styles.dashboardSectionHeader}>
                <Icon name='sync' size={16} color={colors.teal} />
                <Text style={[styles.dashboardSectionTitle, { color: colors.teal }]}>ROUTINE HÀNG NGÀY THEO GIỜ</Text>
              </View>
              {filterByTimeline(dailyRoutines).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  timeLabel={taskTimeLabel(task)}
                  overdue={false}
                  goalTitle={task.goalId ? goalTitleById[task.goalId] : undefined}
                  onToggle={toggleTask}
                  onToggleSubtask={toggleSubtask}
                />
              ))}
            </View>
          )}

          {/* 4. Tomorrow's Plan & Quick Input Section */}
          {activeTimeSegment === 'all' && (
            <View style={styles.dashboardSection}>
              <View style={styles.dashboardSectionHeader}>
                <Icon name='calendar-arrow-right' size={16} color={colors.purple} />
                <Text style={[styles.dashboardSectionTitle, { color: colors.purple }]}>KẾ HOẠCH NGÀY MAI</Text>
              </View>

              {/* Tomorrow's tasks list */}
              {tomorrowTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  timeLabel={taskTimeLabel(task)}
                  overdue={false}
                  goalTitle={task.goalId ? goalTitleById[task.goalId] : undefined}
                  onToggle={toggleTask}
                  onToggleSubtask={toggleSubtask}
                />
              ))}

              {/* Quick Input to Add Tomorrow's Task */}
              <View style={styles.quickInputCard}>
                <TextInput
                  style={styles.quickInput}
                  value={tomorrowTitle}
                  onChangeText={setTomorrowTitle}
                  placeholder="Ngày mai mình sẽ..."
                  placeholderTextColor={colors.tabInactive}
                  onSubmitEditing={handleAddTomorrow}
                />
                <PressableScale style={styles.quickInputAddBtn} onPress={handleAddTomorrow} scaleTo={0.9} haptic='medium'>
                  <Icon name="plus" size={18} color={colors.white} />
                </PressableScale>
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <>
          <FilterPills
            active={activeFilter}
            onSelect={setFilter}
            pendingCount={activeCount}
            completedCount={completedCount}
            overdueCount={overdueCount}
          />

          <FlashList
            data={flattenedList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemType={getItemType}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {/* Floating Action Button */}
      <PressableScale style={styles.fab} onPress={() => setAddVisible(true)} scaleTo={0.93} haptic='medium'>
        <LinearGradient
          colors={FAB_GRADIENT}
          start={{ x: 0.17, y: 0 }}
          end={{ x: 0.83, y: 1 }}
          style={styles.fabGradient}
        >
          <Icon name='plus' size={28} color={colors.white} />
        </LinearGradient>
      </PressableScale>

      <AddTaskModal visible={addVisible} onClose={() => setAddVisible(false)} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.pill,
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  toggleBtnActive: {
    backgroundColor: colors.blue,
  },
  toggleText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.muted,
  },
  toggleTextActive: {
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: spacing.tabClear + 80,
  },
  listContent: {
    paddingBottom: spacing.tabClear + 40,
  },
  overviewCard: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  overviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  overviewLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.6,
  },
  overviewTitle: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
    marginTop: 2,
  },
  overviewPercent: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.green,
  },
  capsuleTrack: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  capsuleSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  legendText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  timelineContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.monoSemibold,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  timelineTrack: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  timelineCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  timelineCellLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 8,
    letterSpacing: 0.2,
  },
  timelineCellCount: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    marginTop: 2,
  },
  dashboardSection: {
    marginBottom: spacing.md,
  },
  dashboardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  dashboardSectionTitle: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  quickInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  quickInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 6,
  },
  quickInputAddBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.tabClear + 16,
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    shadowColor: colors.blue,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
