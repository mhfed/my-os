import { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useJournalStore } from '@/store/journalStore';

import { CalendarStrip } from './components/CalendarStrip';
import { EntryCard } from './components/EntryCard';
import { TimeCapsule } from './components/TimeCapsule';

/** "03 Journal" screen — daily mood, free-form entry and a time capsule. */
export function JournalScreen() {
  const ready = useJournalStore((s) => s.ready);
  const init = useJournalStore((s) => s.init);
  const streak = useJournalStore((s) => s.streak);
  // Re-render the streak pill whenever entries change.
  useJournalStore((s) => s.entries);

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <View style={styles.streakPill}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakNum}>{streak()}</Text>
          <Text style={styles.streakDays}>days</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <CalendarStrip />
        <EntryCard />
        <TimeCapsule />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 22,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.text,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  streakFire: {
    fontSize: 14,
  },
  streakNum: {
    fontFamily: fonts.monoSemibold,
    fontSize: 14,
    color: colors.orange,
  },
  streakDays: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 110,
  },
});
