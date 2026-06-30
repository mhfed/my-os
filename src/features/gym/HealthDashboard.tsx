import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useGymStore } from '@/store/gymStore';
import { formatTxnDate } from '@/utils/date';

export function HealthDashboard() {
  const ready = useGymStore((s) => s.ready);
  const init = useGymStore((s) => s.init);
  const history = useGymStore((s) => s.history);
  const startWorkout = useGymStore((s) => s.startWorkout);

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return <View style={styles.screen} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Health</Text>
        </View>

        {/* Start Workout Card */}
        <Pressable onPress={() => startWorkout('Chest & Triceps')}>
          <LinearGradient
            colors={[colors.purple, '#5D52C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 0.3 }}
            style={styles.startCard}
          >
            <View style={styles.startContent}>
              <Icon name='dumbbell' size={24} color={colors.white} />
              <View>
                <Text style={styles.startTitle}>Start Workout</Text>
                <Text style={styles.startSub}>
                  Empty session or pick template
                </Text>
              </View>
            </View>
            <Icon name='arrow-right' size={20} color={colors.white} />
          </LinearGradient>
        </Pressable>

        {/* Mock Run Tracker Card */}
        <View style={styles.mockCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={[styles.iconBox, { backgroundColor: tint(colors.orange) }]}
            >
              <Icon name='shoe-sneaker' size={20} color={colors.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mockTitle}>Run Tracker</Text>
              <Text style={styles.mockSub}>
                Connect to Strava (Coming soon)
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Workout History</Text>

        <View style={styles.historyList}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No workouts logged yet.</Text>
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
                  {workout.exercises.length} exercises ·{' '}
                  {workout.endTime
                    ? Math.round(
                        (workout.endTime - workout.startTime) / 60000,
                      ) + ' min'
                    : 'Unknown'}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 22,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
  },
  startCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  startContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  startTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.white,
  },
  startSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  mockCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  historyList: {
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  historyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
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
    marginTop: 6,
  },
});
