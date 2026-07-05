import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { AnimatedCard } from '@/components/motion';
import { Icon, IconName } from '@/theme/icons';
import { useJournalStore } from '@/store/journalStore';

import { CalendarStrip } from './components/CalendarStrip';
import { EntryCard } from './components/EntryCard';
import { TimeCapsule } from './components/TimeCapsule';
import { vnDateHeader, vnTimeAgo } from './format';

/** Journal screen (DESIGN_SPEC §5.7) — daily entry, search, time capsule. */
export function JournalScreen() {
  const ready = useJournalStore((s) => s.ready);
  const init = useJournalStore((s) => s.init);
  const entries = useJournalStore((s) => s.entries);
  const streak = useJournalStore((s) => s.streak);
  const searchEntries = useJournalStore((s) => s.searchEntries);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  const streakCount = useMemo(() => streak(), [entries, ready]);
  const searchResults = isSearching && searchQuery.length > 0
    ? searchEntries(searchQuery)
    : [];

  if (!ready) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]} edges={['top']}>
        <View />
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>Nhật ký</Text>
            {streakCount > 0 ? (
              <View style={styles.streakPill}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakNum}>{streakCount}</Text>
                <Text style={styles.streakLabel}>ngày</Text>
              </View>
            ) : null}
          </View>
        </View>
      </AnimatedCard>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name='magnify' size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder='Tìm nhật ký...'
            placeholderTextColor={colors.tabInactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearching(true)}
            onBlur={() => { if (!searchQuery) setIsSearching(false); }}
            returnKeyType='search'
          />
          {isSearching ? (
            <Pressable
              onPress={() => { setSearchQuery(''); setIsSearching(false); }}
              hitSlop={8}
            >
              <Icon name='close' size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isSearching ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {searchQuery.length > 0 ? (
            searchResults.length > 0 ? (
              searchResults.map((entry, index) => (
                <AnimatedCard key={entry.id} index={index + 1} style={styles.searchCard}>
                  <Text style={styles.resultDate}>
                    {vnDateHeader(entry.date)}
                  </Text>
                  <Text style={styles.resultText} numberOfLines={5}>
                    {entry.text}
                  </Text>
                </AnimatedCard>
              ))
            ) : (
              <Text style={styles.noResults}>Không tìm thấy nhật ký nào.</Text>
            )
          ) : null}
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <CalendarStrip />
          <EntryCard />
          <TimeCapsule />
        </ScrollView>
      )}
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.text,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  streakIcon: {
    fontSize: 14,
  },
  streakNum: {
    fontFamily: fonts.monoSemibold,
    fontSize: 14,
    color: colors.orange,
  },
  streakLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  content: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabClear,
    gap: spacing.md,
  },
  searchCard: {
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.rim,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  resultDate: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  resultText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  noResults: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
  },
});
