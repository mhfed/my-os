import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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

  const [creatorOpen, setCreatorOpen] = useState(false);

  const sorted = useMemo(() => [...goals].sort(bySoonestDeadline), [goals]);

  const handleBack = () => router.navigate('/more');

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
            <Text style={styles.title}>Mục tiêu</Text>
          </View>
        </View>
      </AnimatedCard>

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
                onToggle={(mId) => toggleMilestone(item.id, mId)}
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
        icon='target'
        variant='gold'
        size={60}
        style={styles.fab}
        onPress={() => setCreatorOpen(true)}
        accessibilityLabel='Tạo mục tiêu mới'
      />

      <GoalCreatorModal
        visible={creatorOpen}
        onClose={() => setCreatorOpen(false)}
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
              <View style={[styles.skeletonBar, { width: '40%', height: 12 }]} />
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
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerCard: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
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
    marginLeft: -spacing.xs,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.tabClear,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xxl,
  },
  // ---- skeleton ----------------------------------------------------------
  skeletonCard: {
    borderRadius: radius.xl,
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
