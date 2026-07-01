import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { WidgetCard } from '../WidgetCard';
import { useNoteStore } from '@/store/noteStore';

export function NotesWidget() {
  const router = useRouter();
  const ready = useNoteStore((s) => s.ready);

  if (!ready) return null;

  const notes = useNoteStore.getState().notes;
  const latest = notes[0];
  const readingCount = notes.filter((n) => n.isReadingList).length;

  return (
    <WidgetCard
      domain='notes'
      title='Notes'
      icon='note-text-outline'
      onPress={() => router.push('/notes')}
    >
      <Text style={styles.count}>
        {notes.length} note{notes.length !== 1 ? 's' : ''}
      </Text>
      {latest && (
        <Text style={styles.latestLabel} numberOfLines={1}>
          Latest: {latest.title}
        </Text>
      )}
      {readingCount > 0 && (
        <Text style={styles.readingLabel}>
          {readingCount} in reading list
        </Text>
      )}
      {notes.length === 0 && (
        <Text style={styles.empty}>No notes yet</Text>
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 18,
    color: colors.orange,
  },
  latestLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
  },
  readingLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.pink,
  },
  empty: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
});
