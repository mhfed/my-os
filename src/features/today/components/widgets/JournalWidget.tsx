import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useJournalStore } from '@/store/journalStore';
import { todayKey } from '@/utils/day';

const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😄'];

export function JournalWidget() {
  const router = useRouter();
  const ready = useJournalStore((s) => s.ready);

  if (!ready) return null;

  const entry = useJournalStore.getState().entryFor(todayKey());

  return (
    <WidgetCard
      domain='journal'
      title='Journal'
      icon='book-open-page-variant-outline'
      onPress={() => router.push('/journal')}
    >
      {entry ? (
        <>
          <View style={styles.entryRow}>
            <Icon name='check-circle' size={16} color={colors.green} />
            <Text style={styles.writtenText}>Today's entry written</Text>
          </View>
          <View style={styles.moodRow}>
            <Text style={styles.moodEmoji}>{MOOD_EMOJIS[entry.mood]}</Text>
            <Text style={styles.moodLabel}>Mood: {entry.mood + 1}/5</Text>
          </View>
          {entry.text.trim() && (
            <Text style={styles.preview} numberOfLines={2}>
              {entry.text}
            </Text>
          )}
        </>
      ) : (
        <View style={styles.emptyRow}>
          <Icon name='book-outline' size={14} color={colors.muted} />
          <Text style={styles.emptyText}>Not written yet today</Text>
        </View>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  writtenText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.green,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  preview: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15,
    marginTop: 2,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
});
