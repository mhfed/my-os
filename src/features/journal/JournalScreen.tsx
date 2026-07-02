import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FarmBackground } from '@/components/skia';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { useJournalStore } from '@/store/journalStore';
import { formatTxnDate } from '@/utils/date';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchEntries = useJournalStore((s) => s.searchEntries);

  const searchResults =
    isSearching && searchQuery.length > 0 ? searchEntries(searchQuery) : [];

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
      <FarmBackground domain='journal' />
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <View style={styles.streakPill}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakNum}>{streak()}</Text>
          <Text style={styles.streakDays}>days</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name='magnify' size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder='Search entries...'
            placeholderTextColor={colors.tabInactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearching(true)}
            onBlur={() => {
              if (!searchQuery) setIsSearching(false);
            }}
            returnKeyType='search'
          />
          {isSearching && (
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setIsSearching(false);
              }}
              hitSlop={8}
            >
              <Icon name='close' size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {isSearching ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {searchQuery.length > 0 ? (
            searchResults.length > 0 ? (
              searchResults.map((entry) => (
                <View key={entry.id} style={styles.searchResultCard}>
                  <Text style={styles.resultDate}>
                    {formatTxnDate(new Date(entry.date).getTime())}
                  </Text>
                  <Text style={styles.resultText} numberOfLines={4}>
                    {entry.text}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noResults}>No entries found.</Text>
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
  searchContainer: {
    paddingHorizontal: 22,
    marginTop: 20,
    marginBottom: 0,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  noResults: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 40,
  },
  searchResultCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultDate: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8,
  },
  resultText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
