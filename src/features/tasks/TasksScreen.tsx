import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';

import { colors, glass, radius, tint, glow } from '@/theme/colors';
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

interface EqualizerBarData {
  key: TimeSegment;
  label: string;
  total: number;
  completed: number;
  pending: number;
  urgent: number;
  color: string;
}

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

  // goalId -> title lookup
  const goalTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const g of goals) map[g.id] = g.title;
    return map;
  }, [goals]);

  // General counts
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

  // Compute Equalizer Data per period
  const equalizerData = useMemo<EqualizerBarData[]>(() => {
    const segments: { key: TimeSegment; label: string; color: string }[] = [
      { key: 'morning', label: 'SÁNG', color: colors.teal },
      { key: 'afternoon', label: 'TRƯA', color: colors.orange },
      { key: 'evening', label: 'TỐI', color: colors.purple },
      { key: 'anytime', label: 'CHỜ', color: colors.blue },
    ];

    const todayTasks = tasks.filter((t) => t.dueDate == null || t.dueDate < tomorrowStart);

    return segments.map((seg) => {
      const segmentTasks = todayTasks.filter((t) => getTaskTimeSegment(t) === seg.key);
      const total = segmentTasks.length;
      const completed = segmentTasks.filter((t) => t.done).length;
      const urgentCount = segmentTasks.filter((t) => {
        if (t.done) return false;
        if (t.recurrence === 'daily') return false;
        if (t.dueDate != null && t.dueDate < startToDay) return true;
        if (t.priority === 'P0') return true;
        return false;
      }).length;
      const pending = total - completed - urgentCount;

      return {
        key: seg.key,
        label: seg.label,
        total,
        completed,
        pending: pending > 0 ? pending : 0,
        urgent: urgentCount,
        color: seg.color,
      };
    });
  }, [tasks, startToDay, tomorrowStart]);

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

  // Calculate highest task count in equalizer segments for scaling bar heights
  const maxTotal = useMemo(() => {
    const maxVal = Math.max(...equalizerData.map((d) => d.total));
    return maxVal > 0 ? maxVal : 1;
  }, [equalizerData]);

  if (!ready) return <View style={styles.screen} />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <LinearGradient
        colors={['rgba(0,240,255,0.04)', 'rgba(0,0,0,0)']}
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
          
          {/* Cyber Equalizer Monitor Card */}
          <View style={styles.equalizerCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0)']}
              style={StyleSheet.absoluteFillObject}
            />
            
            <View style={styles.eqHeader}>
              <View>
                <Text style={styles.eqLabel}>CYBER MONITORING CORE</Text>
                <Text style={styles.eqTitle}>Mật độ nhiệm vụ trong ngày</Text>
              </View>
              {activeTimeSegment !== 'all' && (
                <PressableScale
                  onPress={() => setActiveTimeSegment('all')}
                  style={styles.resetFilterBtn}
                  scaleTo={0.92}
                >
                  <Text style={styles.resetFilterText}>Xem tất cả</Text>
                </PressableScale>
              )}
            </View>

            {/* Glowing Equalizer Columns */}
            <View style={styles.eqGrid}>
              {equalizerData.map((bar) => {
                const isActive = activeTimeSegment === bar.key;
                
                // Calculate proportional heights (max height is 100px)
                const totalHeight = (bar.total / maxTotal) * 100;
                const completedPct = bar.total > 0 ? (bar.completed / bar.total) * 100 : 0;
                const urgentPct = bar.total > 0 ? (bar.urgent / bar.total) * 100 : 0;
                const pendingPct = bar.total > 0 ? (bar.pending / bar.total) * 100 : 0;

                return (
                  <PressableScale
                    key={bar.key}
                    onPress={() => setActiveTimeSegment(isActive ? 'all' : bar.key)}
                    style={[styles.eqColContainer]}
                    scaleTo={0.95}
                    haptic='medium'
                  >
                    <View
                      style={[
                        styles.eqBarChannel,
                        isActive && { borderColor: bar.color, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
                      ]}
                    >
                      {bar.total > 0 ? (
                        <View style={[styles.eqActiveBar, { height: `${totalHeight}%` }]}>
                          {/* Completed: Green bottom */}
                          {completedPct > 0 && (
                            <View style={[styles.eqSegment, { height: `${completedPct}%`, backgroundColor: colors.green }]} />
                          )}
                          {/* Pending: Blue middle */}
                          {pendingPct > 0 && (
                            <View style={[styles.eqSegment, { height: `${pendingPct}%`, backgroundColor: colors.blue }]} />
                          )}
                          {/* Urgent: Red top */}
                          {urgentPct > 0 && (
                            <View
                              style={[
                                styles.eqSegment,
                                {
                                  height: `${urgentPct}%`,
                                  backgroundColor: colors.red,
                                  borderTopLeftRadius: radius.sm - 4,
                                  borderTopRightRadius: radius.sm - 4,
                                },
                                glow(colors.red, 0.4, 8)
                              ]}
                            />
                          )}
                        </View>
                      ) : (
                        // Empty slot indicator dot
                        <View style={styles.eqEmptyDot} />
                      )}
                    </View>
                    <Text style={[styles.eqColLabel, { color: isActive ? bar.color : colors.muted }]}>
                      {bar.label}
                    </Text>
                    <Text style={styles.eqColCount}>
                      {bar.total}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>

            {/* Micro details row */}
            <View style={styles.eqLegend}>
              <View style={styles.eqLegendItem}>
                <View style={[styles.eqDot, { backgroundColor: colors.red }]} />
                <Text style={styles.eqLegendText}>Khẩn cấp</Text>
              </View>
              <View style={styles.eqLegendItem}>
                <View style={[styles.eqDot, { backgroundColor: colors.blue }]} />
                <Text style={styles.eqLegendText}>Chờ xử lý</Text>
              </View>
              <View style={styles.eqLegendItem}>
                <View style={[styles.eqDot, { backgroundColor: colors.green }]} />
                <Text style={styles.eqLegendText}>Hoàn thành</Text>
              </View>
            </View>
          </View>

          {/* 1. Urgent / ASAP Section */}
          {filterByTimeline(urgentTasks).length > 0 && (
            <View style={styles.dashboardSection}>
              <View style={styles.sectionHeaderWrap}>
                <View style={[styles.glowBullet, { backgroundColor: colors.red }, glow(colors.red, 0.4, 10)]} />
                <Text style={[styles.sectionTitle, { color: colors.red }]}>KHẨN CẤP / QUÁ HẠN</Text>
              </View>
              <View style={styles.urgentWrapper}>
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
            </View>
          )}

          {/* 2. High Priority Section */}
          {filterByTimeline(highPriorityTasks).length > 0 && (
            <View style={styles.dashboardSection}>
              <View style={styles.sectionHeaderWrap}>
                <View style={[styles.glowBullet, { backgroundColor: colors.orange }, glow(colors.orange, 0.4, 10)]} />
                <Text style={[styles.sectionTitle, { color: colors.orange }]}>NHIỆM VỤ ƯU TIÊN CAO</Text>
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

          {/* 3. Daily Routines Section (Vertical Timeline Layout) */}
          {filterByTimeline(dailyRoutines).length > 0 && (
            <View style={styles.dashboardSection}>
              <View style={styles.sectionHeaderWrap}>
                <View style={[styles.glowBullet, { backgroundColor: colors.teal }, glow(colors.teal, 0.4, 10)]} />
                <Text style={[styles.sectionTitle, { color: colors.teal }]}>ROUTINE HÀNG NGÀY THEO GIỜ</Text>
              </View>
              
              {/* Timeline Container */}
              <View style={styles.timelineAxisWrapper}>
                {/* Dashed Line Background */}
                <View style={styles.timelineDashedLine} />

                {filterByTimeline(dailyRoutines).map((task, idx) => {
                  const isLast = idx === filterByTimeline(dailyRoutines).length - 1;
                  return (
                    <View key={task.id} style={[styles.timelineRow, isLast && { marginBottom: 0 }]}>
                      {/* Node Circle */}
                      <View
                        style={[
                          styles.timelineNode,
                          task.done
                            ? { backgroundColor: colors.green, borderColor: colors.greenDeep }
                            : { backgroundColor: colors.teal, borderColor: colors.tealDeep },
                          glow(task.done ? colors.green : colors.teal, 0.35, 10)
                        ]}
                      />
                      
                      {/* Left-side Hour tag */}
                      <View style={styles.timelineTimeBox}>
                        <Text style={[styles.timelineTimeText, { color: task.done ? colors.muted : colors.text }]}>
                          {task.routineTime ?? '00:00'}
                        </Text>
                      </View>

                      {/* Right-side content card */}
                      <View style={styles.timelineCard}>
                        <TaskCard
                          task={task}
                          timeLabel="" // Remove time label in card since hour tag shows it on the left
                          overdue={false}
                          goalTitle={task.goalId ? goalTitleById[task.goalId] : undefined}
                          onToggle={toggleTask}
                          onToggleSubtask={toggleSubtask}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 4. Tomorrow's Plan Section & Quick Input */}
          {activeTimeSegment === 'all' && (
            <View style={styles.dashboardSection}>
              <View style={styles.sectionHeaderWrap}>
                <View style={[styles.glowBullet, { backgroundColor: colors.purple }, glow(colors.purple, 0.4, 10)]} />
                <Text style={[styles.sectionTitle, { color: colors.purple }]}>KẾ HOẠCH NGÀY MAI</Text>
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
  
  // Cyber Equalizer Styles
  equalizerCard: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  eqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  eqLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.2,
  },
  eqTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    marginTop: 2,
  },
  resetFilterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  resetFilterText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.blue,
  },
  eqGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  eqColContainer: {
    alignItems: 'center',
    flex: 1,
  },
  eqBarChannel: {
    width: 24,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: radius.sm - 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  eqActiveBar: {
    width: '100%',
    borderRadius: radius.sm - 2,
    justifyContent: 'flex-end',
  },
  eqSegment: {
    width: '100%',
  },
  eqEmptyDot: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 8,
  },
  eqColLabel: {
    fontFamily: fonts.monoSemibold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  eqColCount: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  eqLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  eqLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eqDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  eqLegendText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },

  // Section Styles
  dashboardSection: {
    marginBottom: spacing.md,
  },
  sectionHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  glowBullet: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  sectionTitle: {
    fontFamily: fonts.monoSemibold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  
  // Urgent Alerts Glowing Border Box
  urgentWrapper: {
    borderColor: tint(colors.red, '15'),
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(239,68,68,0.01)',
  },

  // Vertical Timeline Layout Styles
  timelineAxisWrapper: {
    marginHorizontal: spacing.md,
    paddingLeft: spacing.xl,
    position: 'relative',
  },
  timelineDashedLine: {
    position: 'absolute',
    left: 4,
    top: 12,
    bottom: 12,
    width: 1,
    borderWidth: 1,
    borderColor: tint(colors.teal, '30'),
    borderStyle: 'dashed',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  timelineNode: {
    position: 'absolute',
    left: -28, // Căn chính giữa trục line
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
    zIndex: 2,
  },
  timelineTimeBox: {
    width: 50,
  },
  timelineTimeText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 12,
  },
  timelineCard: {
    flex: 1,
    paddingHorizontal: 0,
  },

  // Tomorrow Quick Planner Input
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
