import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { colors, glass, radius } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { EmptyState, GameIconButton } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { useGoalStore } from '@/store/goalStore';
import { useTasksStore } from '@/store/tasksStore';
import type { Goal } from '@/types/goal';

import { GoalCard } from './components/GoalCard';
import { GoalCreatorModal } from './components/GoalCreatorModal';

/** Sort by soonest deadline; goals with no deadline sink to the bottom. */
function bySoonestDeadline(a: Goal, b: Goal): number {
  const da = a.deadline ?? Number.POSITIVE_INFINITY;
  const db = b.deadline ?? Number.POSITIVE_INFINITY;
  return da - db;
}

/** Goals screen (DESIGN_SPEC §5.6) — goal cards with milestone tracking. */
export function GoalsScreen() {
  const router = useRouter();
  const ready = useGoalStore((s) => s.ready);
  const goals = useGoalStore((s) => s.goals);
  const toggleMilestone = useGoalStore((s) => s.toggleMilestone);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  // Plain-state selectors (safe per AGENTS.md) so contributing tasks stay live.
  const tasks = useTasksStore((s) => s.tasks);
  const toggleTask = useTasksStore((s) => s.toggleTask);

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const sorted = useMemo(() => [...goals].sort(bySoonestDeadline), [goals]);

  // goalId -> its linked standalone tasks (my-os-8u7 cross-module progress).
  const tasksByGoal = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const t of tasks) {
      if (!t.goalId) continue;
      (map[t.goalId] ??= []).push(t);
    }
    return map;
  }, [tasks]);

  const handleBack = () => router.navigate('/more');

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xoá mục tiêu',
      'Bạn có chắc chắn muốn xoá mục tiêu này không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Xoá', style: 'destructive', onPress: () => deleteGoal(id) },
      ],
    );
  };

  const handleEdit = (id: string) => {
    setEditingGoalId(id);
    setCreatorOpen(true);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.screenGlow}
        pointerEvents='none'
      />

      {/* Header — flat, no card */}
      <View style={styles.headerWrap}>
        <PressableScale
          onPress={handleBack}
          haptic='light'
          hitSlop={8}
          style={styles.back}
          accessibilityRole='button'
          accessibilityLabel='Quay lại'
        >
          <Icon name='arrow-left' size={22} color={colors.text} />
        </PressableScale>
        <View>
          <Text style={styles.title}>Mục tiêu</Text>
          <Text style={styles.subtitle}>{goals.length} mục tiêu đang theo đuổi</Text>
        </View>
        <PressableScale
          onPress={() => {
            setEditingGoalId(null);
            setCreatorOpen(true);
          }}
          haptic='light'
          style={styles.addBtn}
          accessibilityLabel='Tạo mục tiêu mới'
        >
          <Icon name='plus' size={20} color={colors.text} />
        </PressableScale>
      </View>

      {/* Divider */}
      <View style={styles.headerDivider} />

      {!ready ? (
        <GoalsSkeleton />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            sorted.length === 0 ? styles.emptyContent : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <AnimatedCard index={index + 1}>
              <GoalCard
                goal={item}
                linkedTasks={tasksByGoal[item.id]}
                onToggle={(mId) => toggleMilestone(item.id, mId)}
                onToggleTask={(taskId) => toggleTask(taskId)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </AnimatedCard>
          )}
          ListEmptyComponent={
            <EmptyState
              icon='target'
              title='Đặt mục tiêu lớn đầu tiên 🎯'
              subtitle='Chia nhỏ ước mơ thành các cột mốc và theo dõi tiến độ mỗi ngày.'
              actionLabel='Tạo mục tiêu'
              actionVariant='gold'
              onAction={() => setCreatorOpen(true)}
            />
          }
        />
      )}

      <GameIconButton
        icon='plus'
        variant='gold'
        size={60}
        style={styles.fab}
        onPress={() => {
          setEditingGoalId(null);
          setCreatorOpen(true);
        }}
        accessibilityLabel='Tạo mục tiêu mới'
      />

      <GoalCreatorModal
        visible={creatorOpen}
        onClose={() => {
          setCreatorOpen(false);
          setEditingGoalId(null);
        }}
        editGoalId={editingGoalId}
      />
    </SafeAreaView>
  );
}

/** Skeleton matching the goal list layout while the store hydrates. */
function GoalsSkeleton() {
  return (
    <View style={styles.listContent}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonLines}>
              <View style={[styles.skeletonBar, { width: '70%' }]} />
              <View
                style={[styles.skeletonBar, { width: '40%', height: 12 }]}
              />
            </View>
            <View style={styles.skeletonRing} />
          </View>
          <View style={[styles.skeletonBar, { width: '90%', marginTop: 16 }]} />
          <View style={[styles.skeletonBar, { width: '55%' }]} />
        </View>
      ))}
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
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  addBtn: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.sm,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.tabClear,
    gap: spacing.sm,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.tabClear + 16,
  },
  // ---- skeleton ----------------------------------------------------------
  skeletonCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.rim,
    backgroundColor: glass.fill,
    padding: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  skeletonLines: {
    flex: 1,
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  skeletonBar: {
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerHigh,
    marginBottom: spacing.xs,
  },
  skeletonRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 8,
    borderColor: colors.surfaceContainerHigh,
  },
});
