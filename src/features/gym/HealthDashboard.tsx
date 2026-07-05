import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, glass, gradients, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { GamePanel } from '@/components/game';
import { AnimatedCard } from '@/components/motion';
import { useGymStore } from '@/store/gymStore';
import { formatTxnDate } from '@/utils/date';

/** Health Dashboard (DESIGN_SPEC §5.4) — workout history, start session, run tracker. */
export function HealthDashboard() {
  const ready = useGymStore((s) => s.ready);
  const init = useGymStore((s) => s.init);
  const history = useGymStore((s) => s.history);
  const startWorkout = useGymStore((s) => s.startWorkout);

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) return <View style={styles.screen} />;

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
        <GamePanel style={styles.headerPanel}>
          <View style={styles.header}>
            <Text style={styles.title}>Sức khỏe</Text>
            <Text style={styles.subtitle}>Tập luyện, phục hồi và chuỗi ngày</Text>
          </View>
        </GamePanel>
      </AnimatedCard>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Start Workout card */}
        <AnimatedCard index={1} style={styles.section}>
          <Pressable onPress={() => startWorkout('Chest & Triceps')}>
            <LinearGradient
              colors={gradients.gem}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.9, y: 0.3 }}
              style={styles.startCard}
            >
              <View style={styles.startContent}>
                <View style={styles.startIconWrap}>
                  <Icon name='dumbbell' size={24} color={colors.white} />
                </View>
                <View>
                  <Text style={styles.startTitle}>Bắt đầu tập</Text>
                  <Text style={styles.startSub}>
                    Buổi trống hoặc chọn giáo án
                  </Text>
                </View>
              </View>
              <Icon name='arrow-right' size={20} color={colors.white} />
            </LinearGradient>
          </Pressable>
        </AnimatedCard>

        {/* Run Tracker (placeholder) */}
        <AnimatedCard index={2} style={styles.section}>
          <GamePanel>
            <View style={styles.mockRow}>
              <View style={[styles.iconBox, { backgroundColor: tint(colors.orange) }]}>
                <Icon name='shoe-sneaker' size={20} color={colors.orange} />
              </View>
              <View style={styles.mockTextWrap}>
                <Text style={styles.mockTitle}>Theo dõi chạy bộ</Text>
                <Text style={styles.mockSub}>Kết nối Strava (Sắp ra mắt)</Text>
              </View>
            </View>
          </GamePanel>
        </AnimatedCard>

        {/* Workout History */}
        <AnimatedCard index={3} style={styles.section}>
          <GamePanel title='Lịch sử tập'>
            <View style={styles.historyList}>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có buổi tập nào.</Text>
              ) : (
                history.map((workout) => (
                  <View key={workout.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyName}>{workout.name}</Text>
                      <Text style={styles.historyDate}>
                        {formatTxnDate(workout.startTime)}
                      </Text>
                    </View>
                    <Text style={styles.historyStats}>
                      {workout.exercises.length} bài tập ·{' '}
                      {workout.endTime
                        ? Math.round((workout.endTime - workout.startTime) / 60000) + ' phút'
                        : 'Không rõ'}
                    </Text>
                  </View>
                ))
              )}
            </View>
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
  headerWrap: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerPanel: {
    marginBottom: spacing.md,
  },
  header: {
    gap: 2,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabClear,
  },
  section: {
    marginTop: spacing.md,
  },
  startCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  startContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  startIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.white,
  },
  startSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mockTextWrap: {
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  mockSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  historyList: {
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  historyCard: {
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyName: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  historyDate: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  historyStats: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
