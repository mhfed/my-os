import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { FarmBackground } from '@/components/skia';
import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useGoalStore } from '@/store/goalStore';
import { formatTxnDate } from '@/utils/date';

import { GoalCreatorModal } from './components/GoalCreatorModal';
import type { Goal } from '@/types/goal';

export function GoalsScreen() {
  const router = useRouter();
  const ready = useGoalStore((s) => s.ready);
  const goals = useGoalStore((s) => s.goals);
  const toggleMilestone = useGoalStore((s) => s.toggleMilestone);

  const [creatorOpen, setCreatorOpen] = useState(false);

  if (!ready) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.red} />
      </View>
    );
  }

  const handleBack = () => router.navigate('/more');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FarmBackground domain='goals' />
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          style={{ position: 'absolute', left: 22, zIndex: 1, top: 12 }}
        >
          <Icon name='arrow-left' size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Goals</Text>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onToggle={(mId) => toggleMilestone(item.id, mId)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No goals set yet. Aim high!</Text>
        }
      />

      <Pressable style={styles.fab} onPress={() => setCreatorOpen(true)}>
        <Icon name='target' size={24} color={colors.screenBg} />
      </Pressable>

      <GoalCreatorModal
        visible={creatorOpen}
        onClose={() => setCreatorOpen(false)}
      />
    </SafeAreaView>
  );
}

function GoalCard({
  goal,
  onToggle,
}: {
  goal: Goal;
  onToggle: (mId: string) => void;
}) {
  const completedStats = goal.milestones.filter((m) => m.done).length;
  const totalStats = goal.milestones.length;
  const pct =
    totalStats > 0 ? Math.round((completedStats / totalStats) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{goal.title}</Text>
          {goal.deadline && (
            <Text style={styles.cardDeadline}>
              Due: {formatTxnDate(goal.deadline)}
            </Text>
          )}
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{pct}%</Text>
        </View>
      </View>

      {goal.description ? (
        <Text style={styles.cardDesc}>{goal.description}</Text>
      ) : null}

      <View style={styles.milestonesBox}>
        {goal.milestones.map((m) => (
          <Pressable
            key={m.id}
            style={styles.mRow}
            onPress={() => onToggle(m.id)}
          >
            <View style={[styles.mCheckbox, m.done && styles.mCheckboxDone]}>
              {m.done && (
                <Icon name='check' size={12} color={colors.screenBg} />
              )}
            </View>
            <Text style={[styles.mTitle, m.done && styles.mTitleDone]}>
              {m.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.track,
    position: 'relative',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    color: colors.text,
  },
  listContent: {
    padding: 22,
    gap: 16,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 2,
  },
  cardDeadline: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.red,
  },
  scoreBox: {
    backgroundColor: tint(colors.red),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
    color: colors.red,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  milestonesBox: {
    backgroundColor: colors.screenBg,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  mRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mCheckboxDone: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  mTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  mTitleDone: {
    color: colors.tabInactive,
    textDecorationLine: 'line-through',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
