import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { WidgetCard } from '../WidgetCard';
import { useNoteStore } from '@/store/noteStore';

export const NotesWidget = memo(function NotesWidget() {
  const router = useRouter();
  const ready = useNoteStore((s) => s.ready);

  if (!ready) return null;

  const notes = useNoteStore.getState().notes;
  const totalNotes = notes.length;
  const latest = notes[0];
  const readingCount = notes.filter((n) => n.isReadingList).length;

  return (
    <WidgetCard
      domain='notes'
      title='Ghi chú'
      icon='note-text-outline'
      onPress={() => router.push('/(tabs)/notes')}
    >
      <View style={styles.headerRow}>
        <Text style={styles.count}>{totalNotes}</Text>
        <Text style={styles.countLabel}>ghi chú</Text>
      </View>

      {latest && (
        <View style={styles.latestCard}>
          <Text style={styles.latestTitle} numberOfLines={1}>{latest.title}</Text>
          <Text style={styles.latestContent} numberOfLines={2}>
            {latest.content ?? 'Chưa có nội dung'}
          </Text>
        </View>
      )}

      {readingCount > 0 && (
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Icon name='bookmark-outline' size={11} color={colors.pink} />
            <Text style={[styles.chipText, { color: colors.pink }]}>
              {readingCount} đọc sau
            </Text>
          </View>
        </View>
      )}

      {totalNotes === 0 && (
        <Text style={styles.empty}>Chưa có ghi chú</Text>
      )}
    </WidgetCard>
  );
});

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 24,
    color: colors.yellow,
  },
  countLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  latestCard: {
    backgroundColor: colors.cardAlt,
    borderRadius: 10,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border + '40',
  },
  latestTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
  },
  latestContent: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.cardAlt,
  },
  chipText: {
    fontFamily: fonts.display,
    fontSize: 10,
  },
  empty: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
